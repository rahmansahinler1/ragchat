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
            Göreviniz verilen bağlam pencerelerini analiz etmek, kullanıcının sorgusuna göre ilgili verileri çıkarmak ve yanıtınızı geliştirmek için dosya bilgilerini kullanmaktır. Birincil amacınız, yalnızca bağlam penceresinde sağlanan bilgileri kullanarak kapsamlı, yapılandırılmış ve kullanıcı dostu bir yanıt sunmaktır.

            Talimatlar:
            Size, her biri birkaç cümle ve şu iki meta veriyi içeren bağlam pencereleri sağlanacaktır:
            Dosya: Her bağlamın kaynağını belirtir.  
            Güven katsayısı: 0 ile 1 arasında bir sayı olup, bağlamın öncelik seviyesini ifade eder (daha yüksek sayılar daha yüksek öncelik anlamına gelir).
            
            İlgili Bilgilerin Çıkarılması:
            Kullanıcının sorgusunda istenen belirli bilgileri belirlemek için dikkatlice analiz yapın.
            Doğruluk için daha yüksek güven seviyelerine sahip bağlamlara öncelik vererek tüm ilgili bağlam pencerelerini kullanın.
            Sorgu belirli bir dosyayı referans alıyorsa, yalnızca belirtilen dosya(lar)dan bilgi çıkarın.
            Sorgu herhangi bir dosya belirtmiyorsa, mevcut tüm dosyalardan bilgileri birleştirin.
            Bağlam birden fazla dosyada tutarlı bilgiler içeriyorsa, verileri birleştirin ve tutarlılığı belirtin.     
            Bağlam çelişkili bilgiler içeriyorsa: Çelişkileri vurgulayın, kaynaklarını belirtin ve nasıl farklılık gösterdiklerini açıklayın.
            Bağlam benzer veya farklı bilgiler içeriyorsa, farklılıkları veya benzerlikleri özetleyin ve bunları sorguyla ilişkilendirin.
            Yanıtınızı daha iyi okunabilirlik için madde işaretleri veya konuya dayalı bölümler kullanarak sunun.
            Netlik ve özlülüğe öncelik verin. Karmaşık sorgular için alt başlıklar veya kategoriler kullanın.
            Gerekli bilgi bağlamda bulunmuyorsa, bunu açıkça belirtin ve mümkünse öneriler veya açıklamalar sunun.
            Yanıtta güven katsayısını belirtmeyin.
                                   
            *Kesinlikle* aşağıdaki formatta yanıt verin:
            Çıkarılan Bilgiler: Sorguya dayalı açık, yapılandırılmış bir yanıt sağlayın. Uygun olduğunda madde işaretleri veya başlıklar kullanın. Eğer madde işaretleri veya başlıklar kullanıyorsanız, Başlık gibi kalın metin kullanın.]
            Güven Seviyesi: [Yüksek/Orta/Düşük - Metindeki bilginin açıklık derecesine göre yalnızca bir kelimeyle yanıtlayın: yüksek, orta veya düşük]
            Çıkarılan Bilgiler ve Güven Seviyesi metinlerinde kalın yazı kullanmayın.

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu:
            {query}
            """)
        else:
            return textwrap.dedent(f"""
            Your task is to analyze the given context windows, extract relevant data based on the user's query, and use file information to enhance your response. Your primary goal is to provide a comprehensive, structured, and user-friendly answer using solely the information provided in the context window.

            Instructions:
            You will be provided with context windows, each containing several sentences along with the two following metadata: 
            File: Specifies source of each context. 
            Confidence coefficient: A number between 0 and 1, indicating the priority of the context (higher numbers mean higher priority).

            Extracting Relevant Information:
            Carefully analyze the user's query to determine the specific information being requested.
            Use all relevant context windows, prioritizing those with higher confidence levels for accuracy.
            If the query references a specific file, extract information only from the specified file(s).
            If the query does not specify a file, aggregate information from all available files.
            If the context contains consistent information across multiple files, consolidate the data and indicate consistency.
            If the context contains contradictory information: Highlight the contradictions, specify their sources, and explain how they differ.
            If the context contains similar or different information, summarize the distinctions or similarities and relate them to the query.
            Present your response using bullet points or topic-based sections for better readability.
            Prioritize clarity and conciseness. Use subheadings or categories for complex queries.
            If the required information is not found in the context, state this clearly and offer suggestions or clarifications if possible.
            Do not specify the confidence coefficient in response.

            Respond *strictly* in the following format:

            Extracted Information: 

            [header]Section Name[/header]
            \n- Content with [b]bold terms[/b] when needed

            [header]Another Section[/header]
            \n- More content with [b]important terms[/b]

            Rules:
            1. Each major section must start with [header]...[/header]
            2. Use [b]...[/b] for important terms or emphasis within content
            3. Each point starts with \n- 
            4. Leave an empty line between sections (\n\n)
            5. Headers should be one of: Definition, Purpose, Key Features, Operation, Context, etc.

            Confidence Level: [High/Medium/Low]                                 
                                   
            Context Windows:
            {context}

            User Query:
            {query}
            """)

    def response_generation(self, query, context):
        lang = self.detect_language(query=query)
        prompt = self._prompt_answer_generation(query=query, context=context, lang=lang)
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query},
            ],
            temperature=0,
        )
        answer = response.choices[0].message.content.strip()
        return answer

    def query_generation(self, query):
        lang = self.detect_language(query=query)
        prompt = self._prompt_query_generation(query, lang=lang)
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": query},
            ],
            temperature=0,
        )
        new_queries = response.choices[0].message.content.strip()
        return new_queries

    def detect_language(self, query):
        lang = detect(text=query)
        return "tr" if lang == "tr" else "en"
