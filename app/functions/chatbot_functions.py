from openai import OpenAI
from dotenv import load_dotenv
from langdetect import detect
import textwrap


class ChatbotFunctions:
    def __init__(self):
        load_dotenv()
        self.client = OpenAI()

    def _prompt_query_generation(self, query, lang):
        if lang == "tr":
            return textwrap.dedent(f"""
            Görev: Önce anlamı sonra yazım hatalarını kontrol edin ve anlamsal olarak benzer 5 soru oluşturun.

            Talimatlar: Size bir kullanıcı sorusu verilir.
            Öncelikle kullanıcı sorusunu kontrol edin, eğer kullanıcı sorusunun anlamı yoksa boş string '' döndürün, soru anlamlıysa şunları yapın:
            Herhangi bir yazım veya dilbilgisi hatası olup olmadığını kontrol edin ve düzeltilmiş soruyu çıktıdaki ilk soru olarak döndürün.
            Ardından, düzeltilmiş soruya anlamsal olarak benzer 5 ek soru oluşturun.
            Oluşturulan soruların kelime kullanımının farklı olmasını ancak orijinal sorunun aynı anlamını veya amacını korumasını sağlayın.
            Çıktıyı **kesinlikle** başka bir metin veya açıklama eklemeden aşağıdaki şablon formatında döndürün:

            [düzeltilmiş soru]
            [birinci anlamsal benzer soru]
            [ikinci anlamsal benzer soru]
            [üçüncü anlamsal benzer soru]
            [dördüncü anlamsal benzer soru]
            [beşinci anlamsal benzer soru]

            Çıktınız tam olarak bu formatı takip etmelidir. Bu şablonun ötesinde hiçbir ek bilgi veya metin eklenmemelidir.
            
            Kullanıcı sorusu: {query}
            """)
        else:
            return textwrap.dedent(f"""
            Task: Check for meaning first then spelling errors and create 5 semantically similar questions.

            Instructions: You are given a user question. 
            First, check the user question, if the user question has no meaning then return empty string '' if question is meaningul do the following:
            Check for any spelling or grammatical errors, and return the corrected question as the first question in the output. 
            Then, generate 5 additional questions that are semantically similar to the corrected question. 
            Ensure that the generated questions vary in wording but retain the same meaning or intent as the original question. 
            Return the output **strictly** in the following template format without any additional text or explanations:

            [corrected question]
            [first semantically similar question]
            [second semantically similar question]
            [third semantically similar question]
            [fourth semantically similar question]
            [fifth semantically similar question]

            Your output should follow this format exactly. No extra information or text should be included beyond this template.
            
            User question: {query}
            """)

    def _prompt_answer_generation(self, query, context, lang):
        if lang == "tr":
            return textwrap.dedent(f"""
            Siz, verilen metinden belirli bilgileri çıkarmada uzmanlaşmış bir yapay zeka asistanısınız.
            Göreviniz, verilen bağlam pencerelerini analiz etmek ve kullanıcının sorgusu temelinde ilgili verileri çıkarmaktır.

            Talimatlar:
            1. Size her biri birkaç cümle içeren bağlam penceresi verilecektir.
            2. Her bağlam cümlesinin sonuna bir güven düzeyi sayısı eklenmiştir; daha yüksek güven sayısı, yanıt oluştururken daha yüksek öncelik anlamına gelir. Güven düzeyleri 0 ile 1 arasında olacaktır.
            3. Tüm bağlam pencerelerini dikkatle okuyun.
            4. Kullanıcının hangi özel bilgiyi aradığını anlamak için kullanıcının sorgusunu analiz edin.
            5. Bağlam pencerelerinden ilgili bilgileri arayın ve çıkarın.
            6. İstenen bilgi bağlam pencerelerinin hiçbirinde mevcut değilse, bunu açıkça belirtin.
            7. Çıkarılan bilgileri açık ve özlü bir şekilde sunun.
            8. Uygunsa, çıkarılan veriler için kısa bir bağlam veya açıklama sağlayın.

            Aşağıdaki formatta yanıt verin:
            - Çıkarılan Bilgi: [Çıkarılan veriyi buraya yazın]
            - Ek Bağlam: [Gerekirse, kısa bir açıklama veya bağlam sağlayın]
            - Güven Düzeyi: [Yüksek/Orta/Düşük - bilginin metinde ne kadar açık bir şekilde belirtildiğine bağlı olarak]

            Yalnızca verilen bağlam pencerelerindeki bilgilere odaklanmayı unutmayın. Açıkça belirtilenlerin ötesinde harici bilgi eklemeyin veya varsayımlarda bulunmayın.

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu: {query}
            """)
        else:
            return textwrap.dedent(f"""
            You are an AI assistant specialized in extracting specific information from provided text.
            Your task is to analyze the given context windows and extract relevant data based on the user's query.

            Instructions:
            1. You will be provided with context windows, each containing several sentences.
            2. There are confidence level specified as numbers after each context sentence, higher confidence number means higher priority in creating answer. Create the answer according to confidence levels. Confidence levels are going to be between 0 and 1.
            3. Carefully read all context windows.
            4. Analyze the user's query to understand what specific information they are looking for.
            5. Search for and extract the relevant information from the context windows according to the hierarchy and ensure your response reflects this priority.
            6. If the requested information is not present in any of the context windows, state that clearly.
            7. Present the extracted information in a clear and concise manner.
            8. If appropriate, provide brief context or explanation for the extracted data.

            Respond in the following format:
            - Extracted Information: [Provide the extracted data here]
            - Extra information: [Provide brief context or explanation]
            - Confidence: [High/Medium/Low - based on how clearly the information was stated in the text]

            Remember to focus solely on the information present in the provided context windows. Do not include external knowledge or make assumptions beyond what is explicitly stated.

            Context Windows:
            {context}

            User Query: {query}
            """)

    def response_generation(self, query, context):
        lang = self.detect_language(query=query)
        prompt = self._prompt_answer_generation(
            query=query,
            context=context,
            lang=lang
        )
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query}
            ],
            temperature=0
        )
        answer = response.choices[0].message.content.strip()
        return answer
    
    def query_generation(self, query):
        lang = self.detect_language(query=query)
        prompt = self._prompt_query_generation(
            query,
            lang=lang
        )
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query}
            ],
            temperature=0
        )
        new_queries = response.choices[0].message.content.strip()
        return new_queries

    def detect_language(self, query):
        lang = "en"
        try:
            lang = detect(text=query)
            if lang == "tr":
                return lang
            else:
                return "en"
        except:
            return "en"
