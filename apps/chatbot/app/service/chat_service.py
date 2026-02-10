from app.infra.vector_store import VectorStore, QdrantError
from app.infra.rule_based_llm_client import RuleBasedLlmClient
from app.service.rule_based_route_classifier import Route
from app.core.settings import settings
import logging
import math
import re
from collections import Counter

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.vector = VectorStore.get_instance()
        self.llm = RuleBasedLlmClient()

    def handle(self, route: Route, message: str, company_id: int):
        logger.info(f"Handling message: '{message}' for company_id: {company_id} with route: {route}")

        if route == Route.DOCUMENT:
            try:
                # Hybrid Search (Semantic + Lexical)
                raw_docs = self.vector.search(
                    query=message,
                    company_id=company_id,
                    limit=30
                )
                
                if not raw_docs:
                    return "관련 문서를 찾을 수 없습니다."

                scored_results = self._rank_with_content(message, raw_docs)

                scored_results.sort(key=lambda x: x[0], reverse=True)

                logger.info(f"--- Hybrid Search Results (Query: '{message}') ---")
                for i, (f_score, s_score, l_score, doc) in enumerate(scored_results[:3]):
                    logger.info(
                        f"Rank {i+1}: Total={f_score:.3f} (Sem={s_score:.3f}, Lex={l_score:.3f}) | Doc='{doc.get('docTitle')}' | Section='{doc.get('sectionTitle')}'"
                    )

                # Relevance Guard (use combined score)
                if not scored_results or scored_results[0][0] < settings.RELEVANCE_THRESHOLD:
                    return "죄송합니다. 요청하신 내용은 현재 등록된 회사 제도 및 규정에서 찾을 수 없습니다. 인사업무나 규정에 관련한 질문을 부탁드립니다."

                return scored_results[0][3].get("content", "내용을 찾을 수 없습니다.")
            except QdrantError as e:
                logger.error(f"Error accessing VectorStore for DOCUMENT route: {e}")
                return "문서 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."


        if route == Route.PERSONAL:
            logger.info("Responding to PERSONAL route.")
            return "개인/조직 데이터 기능은 준비 중입니다."

        logger.info("Responding with default SMALL_TALK message.")
        return "안녕하세요. HRadar 챗봇입니다."

    def _tokenize(self, text: str) -> list[str]:
        if not text:
            return []
        tokens = re.split(r"[^0-9a-zA-Z가-힣]+", text.lower())
        return [t for t in tokens if len(t) >= 2]

    def _lexical_score(self, query_tokens: list[str], payload: dict) -> float:
        doc_title = (payload.get("docTitle") or "").lower()
        section_title = (payload.get("sectionTitle") or "").lower()
        content = (payload.get("content") or "").lower()

        content_tokens = self._tokenize(content)
        if not content_tokens:
            return 0.0

        content_tf = Counter(content_tokens)
        content_len_norm = math.sqrt(len(content_tokens))

        score = 0.0
        for token in query_tokens:
            if token in section_title:
                score += 4.0
            elif token in doc_title:
                score += 2.0

            tf = content_tf.get(token, 0)
            if tf > 0:
                score += (1.0 + math.log1p(tf)) / content_len_norm

        # Phrase boost for exact query substring
        query_text = " ".join(query_tokens)
        if len(query_text) >= 4 and query_text in content:
            score += 1.5

        return score

    def _rank_with_content(self, message: str, raw_docs: list[dict]) -> list[tuple[float, float, float, dict]]:
        query_tokens = self._tokenize(message)
        if not query_tokens:
            return [(d["score"], d["score"], 0.0, d["payload"]) for d in raw_docs]

        scored = []
        lexical_scores = []
        for d in raw_docs:
            payload = d["payload"]
            semantic_score = d["score"]
            lexical_score = self._lexical_score(query_tokens, payload)
            lexical_scores.append(lexical_score)
            scored.append((semantic_score, lexical_score, payload))

        max_lex = max(lexical_scores) if lexical_scores else 0.0
        combined = []
        for semantic_score, lexical_score, payload in scored:
            lex_norm = (lexical_score / max_lex) if max_lex > 0 else 0.0
            final_score = (semantic_score * 0.7) + (lex_norm * 0.3)
            combined.append((final_score, semantic_score, lex_norm, payload))
        return combined
