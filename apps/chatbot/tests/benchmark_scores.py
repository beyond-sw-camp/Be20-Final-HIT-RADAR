def get_roots(text):
    particles = ["은", "는", "이", "가", "을", "를", "에", "의", "로", "으로", "도", "만", "에서", "부터", "까지"]
    words = text.split()
    roots = []
    for w in words:
        clean_w = w.strip("?.!,")
        for p in particles:
            if clean_w.endswith(p) and len(clean_w) > len(p):
                clean_w = clean_w[:-len(p)]
                break
        if len(clean_w) >= 2:
            roots.append(clean_w)
    return roots

def calculate_score(query, payload, v_score):
    query_roots = get_roots(query)
    doc_title = payload.get("docTitle", payload.get("title", "")).replace(" ", "")
    section_title = payload.get("sectionTitle", "").replace(" ", "")
    content = payload.get("content", "")
    
    lexical_score = 0
    matched_roots = set()
    
    for root in query_roots:
        found = False
        if section_title and root in section_title:
            lexical_score += 5.0
            found = True
        elif doc_title and root in doc_title:
            lexical_score += 3.0
            found = True
        elif root in content:
            lexical_score += 0.5
            found = True
            
        if found:
            matched_roots.add(root)
            
    # Key improvement: Multi-root match bonus
    # If a chunk matches 3 keywords vs 1 keyword, it should be significantly boosted
    lexical_score += (len(matched_roots) ** 2) * 2.0 
    
    return v_score + lexical_score

# Mock scenarios
scenarios = [
    {
        "query": "휴가 승인 절차 알려줘봐",
        "docs": [
            {
                "id": "correct",
                "v_score": 0.65,
                "payload": {"title": "휴가 신청 절차", "sectionTitle": "승인 절차", "content": "휴가 신청은 소속 부서장의 승인을 받아야 합니다."}
            },
            {
                "id": "wrong",
                "v_score": 0.70,
                "payload": {"docTitle": "초과근무 규정", "sectionTitle": "사전 승인", "content": "초과근무는 사전 승인을 받아야 인정됩니다."}
            }
        ]
    }
]

for s in scenarios:
    print(f"\n--- Scenario: {s['query']} ---")
    results = []
    for d in s['docs']:
        score = calculate_score(s['query'], d['payload'], d['v_score'])
        results.append((score, d))
    
    results.sort(key=lambda x: x[0], reverse=True)
    for i, (score, d) in enumerate(results):
        print(f"Rank {i+1}: Score={score:.2f} | Payload={d['payload'].get('title') or d['payload'].get('docTitle')} > {d['payload'].get('sectionTitle')}")
