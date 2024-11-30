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
            Görev: Analiz Et, Düzelt ve İlgili Sorular & Cevaplar Oluştur.

            Talimatlar: 
            Kullanıcı sorgusu size verilmiştir.
            Öncelikle Kullanıcı sorusunu kontrol edin. Eğer anlamsızsa, boş bir string '' döndürün. Anlamlıysa, şu işlemleri yapın:
            Herhangi bir yazım veya dilbilgisi hatası olup olmadığını kontrol edin ve düzeltilmiş soruyu çıktıdaki ilk soru olarak döndürün.
            Ardından, Düzeltmiş soruyla aynı anlamı koruyan 3 semantik olarak benzer sorgu oluşturun.
            Orijinal soruyu farklı açılardan ele alan, ancak yine de ilgili kalan 3 farklı soru oluşturun.
            Son 3 soruya, her biri 1-2 cümlelik kısa cevaplarla yanıt verin.
            Ardından düzeltilmiş kullanıcı sorgusunu analiz edin ve niyetini belirleyin. Olası niyet listesi aşağıdadır:
                                   
            Olası niyetler:
            1.Bilgi Edinme: Gerçek bilgileri, tanımları veya açıklamaları öğrenme talebi.
            2.Özetleme: Karmaşık bilgilerin kısa bir özetini isteme.
            3.Karşılaştırma: Seçenekleri, yöntemleri veya teknolojileri değerlendirme.
                                   
            Çıktıyı **kesinlikle** şu formatta döndürün:
            [düzeltilmiş sorgu]  
            [birinci semantik olarak benzer sorgu]  
            [ikinci semantik olarak benzer sorgu]  
            [üçüncü semantik olarak benzer sorgu]  
            [birinci farklı-açıdan soru]  
            [ikinci farklı-açıdan soru]  
            [üçüncü farklı-açıdan soru]  
            [birinci farklı-açıdan cevap]  
            [ikinci farklı-açıdan cevap]  
            [üçüncü farklı-açıdan cevap]  
            [kullanıcı niyeti]   
                                   
            Kullanıcı Sorgusu: {query}

            Örnek:
            Kullanıcı sorgusu: "Retrieval-augmented generation yapay zeka sistemlerinde nasıl çalışır?"

            Çıktı:
            Retrieval-augmented generation yapay zeka sistemlerinde nasıl çalışır?
            Retrieval-augmented generation süreci yapay zekada nasıl işler?
            RAG, yapay zeka sistemlerine bilgi getirme ve oluşturma konusunda nasıl yardımcı olur?
            Retrieval-augmented generation yapay zeka uygulamalarında nasıl işlev görür?
            RAG kullanmanın yapay zeka için temel avantajları nelerdir?
            RAG, geleneksel makine öğrenimi modellerinden nasıl farklıdır?
            RAG’in uygulanmasında karşılaşılan zorluklar nelerdir?
            RAG, yapay zekayı dış verileri getirerek daha doğru yanıtlar sağlamada geliştirir.
            RAG, geleneksel modellerden farklı olarak çıkarım sırasında harici bilgilere erişim sağlar.
            Başlıca zorluklar arasında getirme gecikmesi, getirilen verilerin uygunluğu ve bilgilerin güncel tutulması yer alır.
            Bilgi Edinme
            
            Kullanıcı sorusu: {query}
            """)
        else:
            return textwrap.dedent(f"""
            Task: Analyze, Correct, and Generate Related Questions & Answers
            Instructions:
            You are given a user query.

            First, check the user question. If it has no meaning, return an empty string. If it is meaningful, do the following:
            Correct any spelling or grammatical errors and return the corrected question as the first line of the output.
            Generate 3 semantically similar queries that retain the same meaning as the corrected query.
            Create 3 different questions that approach the original query from different angles but stay related.
            Answer last 3 questions with concise responses, 1-2 sentences max each.
            Then, analyze the corrected user query and determine its intent, intention list is given below. 
                                                         
            The possible intents are:
            1. Informational: Seeking factual knowledge, definitions, or explanations.
            2. Summarization: Requesting a concise overview of complex information. 
            3. Comparison: Evaluating options, methods, or technologies. 

            Return the output **strictly** in the following format:
            [corrected query]  
            [first semantically similar query]  
            [second semantically similar query]  
            [third semantically similar query]  
            [first different-angle question]  
            [second different-angle question]  
            [third different-angle question]  
            [first different-angle answer]  
            [second different-angle answer]  
            [third different-angle answer]
	        [user intention] 

            User query: {query}

            Example:
            User query: "How does retrieval-augmented generation work in AI systems?"

            Output:
            How does retrieval-augmented generation work in AI systems?
            What is the process of retrieval-augmented generation in AI?
            How does RAG help AI systems retrieve and generate information?
            Can you explain how retrieval-augmented generation functions in AI applications?
            What are the key advantages of using RAG in AI?
            How does RAG differ from traditional machine learning models?
            What challenges does RAG face in implementation?
            RAG enhances AI by providing more accurate responses by retrieving relevant external data.
            Unlike traditional models, RAG integrates search capabilities to access external knowledge during inference.
            Major challenges include latency in retrieval, ensuring relevance of fetched data, and maintaining up-to-date information.
	        Informational
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
            Çıkarılan Bilgiler:
            
            [header]Bölüm Adı[/header]  
            \n- İçerik, gerektiğinde [b]kalın terimler[/b] ile  

            [header]Bir Başka Bölüm[/header]  
            \n- Daha fazla içerik, [b]önemli terimler[/b] ile  

            Kurallar:  
            1. Her ana bölüm [header]...[/header] ile başlamalıdır  
            2. İçerikte önemli terimler veya vurgular için [b]...[/b] kullanın  
            3. Her madde işareti \n- ile başlamalıdır  
            4. Bölümler arasında bir boş satır bırakın (\n\n)  
            5. Başlıklar şu kategorilerden biri olmalıdır: Tanım, Amaç, Temel Özellikler, İşleyiş, Bağlam vb.
            
            Güven Seviyesi: [Yüksek/Orta/Düşük]

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

    def response_generation(self, query, context, intention):
        lang = self.detect_language(query=query)
        prompt = self._prompt_answer_generation(query=query, context=context, lang=lang, intention=intention)
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
