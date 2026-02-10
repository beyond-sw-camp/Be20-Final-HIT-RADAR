class RuleBasedLlmClient:
    def __init__(self):
        pass

    def answer_with_context(self, question: str, context: str) -> str:
        # This is a simplified, rule-based approach.
        # In a real scenario, you might have more sophisticated rules or
        # integrate with a lighter-weight model or a template-based response system.

        if not context:
            return "관련 문서를 찾을 수 없습니다."
        
        # For demonstration, we'll just return a combination of the question and context
        # or a generic answer based on the presence of context.
        # In a real LLM, this would involve a complex prompt.
        # For a rule-based client, we try to extract a concise answer.
        # Let's assume the most relevant information is at the beginning of the context.
        # We'll return the first sentence(s) up to a reasonable limit.
        sentences = context.split('. ')
        concise_answer = ""
        for sentence in sentences:
            if len(concise_answer) + len(sentence) + 2 < 200: # Try to fit within 200 chars
                concise_answer += sentence + ". "
            else:
                break
        if not concise_answer: # Fallback if no sentence fits or context is too short
            concise_answer = context[:200]
        return concise_answer.strip()
