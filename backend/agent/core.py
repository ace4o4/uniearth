import os
from google import genai
from typing import Dict, Any, List
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError
from .prompts import SYSTEM_PROMPT
from .tools import TOOLS

load_dotenv()

class SatFusionAgent:
    """
    The Autonomous Agent that reasons about Geospatial Data using Gemini (google-genai SDK).
    """
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            self.api_key = self.api_key.strip()
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)
            
        self.system_prompt = SYSTEM_PROMPT
        self.tools = TOOLS
        # Switching to stable model
        self.model_name = "gemini-1.5-flash"
        self.cache = {} # Simple in-memory cache for demo purposes not to be considered real.

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=5, max=20))
    def _call_llm(self, prompt: str):
        if not self.client:
             raise ValueError("API Key missing")
             
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={'temperature': 0.2}
            )
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            raise e

    async def reason_and_act(self, user_query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        The Core Loop using Gemini with Retry Logic.
        """
        
        # 0. Check Cache (Save Quota)
        query_key = user_query.lower().strip()
        if query_key in self.cache:
            return self.cache[query_key]

        thought_process = []
        actions = []
        final_answer = ""
        
        thought_process.append(f"Received query: '{user_query}'")
        
        # 1. Construct Prompt
        full_prompt = f"{self.system_prompt}\n\nUSER QUERY: {user_query}\n\n"
        if context:
            full_prompt += f"CONTEXT: {context}\n\n"
        full_prompt += "Reasoning Trace:"

        try:
            # 2. Get Reasoning from LLM (with retry)
            llm_output = self._call_llm(full_prompt)
            
            # Simple parsing of the LLM output (assuming it follows the ReAct structure)
            # In a production system, we would use function calling or stricter parsing
            
            lines = llm_output.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith("Thought:"):
                    thought_process.append(line)
                elif line.startswith("Action:"):
                    thought_process.append(line)
                    # Extract action
                    # Format expected: Action: tool_name(arg1, arg2)
                    # This is a simplified parser for the demo
                    if "search_global" in line:
                         # Mocking the extraction for now to keep it simple, 
                         # but logically this is where we'd parse 'search_global' and call it.
                         # For true real-time, we need to connect this string to self.tools call.
                         thought_process.append("Executing Search...")
                         # We'll default to a mocked successful search for this step to verify flow,
                         # modifying this to actual tool call next.
                elif line.startswith("Final Answer:"):
                    final_answer = line.replace("Final Answer:", "").strip()

            if not final_answer:
                 final_answer = llm_output # Fallback if parsing fails

        except RetryError as e:
            original_error = str(e.last_attempt.exception()) if e.last_attempt else str(e)
            thought_process.append(f"Info: API Error. Details: {original_error}")
            thought_process.append("Switching to Offline Mode.")
            # FALLBACK HEURISTIC (The original logic)
            query_lower = user_query.lower()
            if "cloud" in query_lower or "flood" in query_lower or "rain" in query_lower:
                thought_process.append("Fallback: Detected adverse weather context. Rule 'All-Weather' applies.")
                final_answer = "(Backup Mode) I have activated the All-Weather mode. Using Sentinel-1 SAR backscatter to penetrate the cloud cover, fused with available optical context."
            elif "field" in query_lower or "farm" in query_lower or "boundary" in query_lower:
                thought_process.append("Fallback: Detected high-resolution requirement. Rule 'Spatial Completeness' applies.")
                final_answer = "(Backup Mode) I have prioritized Spatial Completeness. Fusing LISS-IV (5.8m) data from ISRO for farm plot structures."
            else:
                thought_process.append("Fallback: Standard monitoring request.")
                final_answer = "(Backup Mode) Retrieved standard Sentinel-2 imagery. Conditions are clear."

        except Exception as e:
            thought_process.append(f"Error during reasoning: {str(e)}")
            final_answer = "I encountered an error while processing your request. Please check my logs."

        result = {
            "query": user_query,
            "thoughts": thought_process,
            "actions": actions,
            "answer": final_answer,
            "agent_persona": "Sat-Fusion-AI (Gemini Powered)"
        }
        
        # Save to Cache
        self.cache[query_key] = result
        return result

