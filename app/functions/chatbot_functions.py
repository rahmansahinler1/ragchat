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
            Ardından düzeltilmiş kullanıcı sorgusunu analiz edin ve niyetini belirleyin.  Niyet listesi, anahtar kelimeler ve örnekler aşağıda verilmiştir. Eğer niyet tam olarak anlaşılmaz ise boş bir string '' döndür.
                                   
            Olası niyetler:
            1. Bilgi Edinme: Gerçek bilgileri, tanımları veya açıklamaları öğrenme talebi.
                Niyet Anahtar Kelimeleri: Ne, tanımla, açıkla, detaylar, belirt, kim, neden, nasıl.
                Niyet Örnekleri: Bu kuralı ihlal etmenin cezası nedir? → Bilgilendirme
            2. Özetleme: Karmaşık bilgilerin kısa bir özetini isteme.
                Niyet Anahtar Kelimeleri: Özetle, genel bakış, ana noktalar, temel fikirler, kısa, öz, basitleştir.
                Niyet Örnekleri: Bu belgenin ana noktalarını özetleyebilir misiniz? → Özetleme
            3. Karşılaştırma: Seçenekleri, yöntemleri veya teknolojileri değerlendirme.
                Niyet Anahtar Kelimeleri: Karşılaştır, fark, benzerlik, karşılaştırma, daha iyi, alternatif, artılar ve eksiler.
                Niyet Örnekleri: Bu iki yöntemin faydalarını karşılaştırın. → Karşılaştırma
                                   
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
            Then, analyze the corrected user query and determine its intent, intention list is and their keywords, examples are given below. If intent can't be determined return empty '' string.
                                                         
            The possible intents are:
            1. Informational: Seeking factual knowledge, definitions, or explanations. 
                Intention Keywords: What, define, explain, details, specify, who, why, how. 
                Intention Examples: What is the penalty for breaking this rule? → Informational
            2. Summarization: Requesting a concise overview of complex information. 
                Intention Keywords: Summarize, overview, main points, key ideas, brief, concise, simplify. 
                Intention Examples: Can you summarize the key points of this document? → Summarization
            3. Comparison: Evaluating options, methods, or technologies. 
                Intention Keywords: Compare, difference, similarity, versus, contrast, better, alternative, pros and cons. 
                Intention Examples: Compare the benefits of these two methods. → Comparison

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

    def _prompt_answer_generation(self, query, context, lang, intention):
        if lang == "tr" and intention == "":
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

            [header]Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)
            [header]Başka Bir Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)

            Kurallar:  
            1. Her ana bölüm [header]...[/header] ile başlamalıdır  
            2. İçerikte önemli terimler veya vurgular için [b]...[/b] kullanın  
            3. Başlıklar şu kategorilerden biri olmalıdır: Tanım, Amaç, Temel Özellikler, İşleyiş, Bağlam
            4. Maddeler arasında ekstra olarak satır başı kullanmayın
            5. Sadece ana bölümler arasında satır başı kullanın

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu:
            {query}
            """)
        elif lang == "en" and intention == "":
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
            Do not mention about the 'context windows'. 'Use according to resources' instead.

            Respond *strictly* in the following format:

            [header]Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)
            [header]Another Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)

            Rules:
            1. Each major section must start with [header]...[/header]
            2. Use [bold]...[/bold] for important terms or emphasis within content
            3. Headers should be one of: Definition, Purpose, Key Features, Operation, Context
            4. Do not add extra line breaks between substances
            5. Only use line breaks between major sections                          
                                   
            Context Windows:
            {context}

            User Query:
            {query}
            """)
        elif lang == "tr" and intention == "Bilgi Edinme":
            return textwrap.dedent(f"""
            Göreviniz verilen bağlam pencerelerini analiz etmek, kullanıcının sorgusuna göre ilgili verileri çıkarmak ve yanıtınızı geliştirmek için dosya bilgilerini kullanmaktır. Birincil amacınız, yalnızca bağlam penceresinde sağlanan bilgileri kullanarak kapsamlı, yapılandırılmış ve kullanıcı dostu bir yanıt sunmaktır.

            Talimatlar:
            Size, her biri birkaç cümle ve şu iki meta veriyi içeren bağlam pencereleri sağlanacaktır:
            Dosya: Her bağlamın kaynağını belirtir.  
            Güven katsayısı: 0 ile 1 arasında bir sayı olup, bağlamın öncelik seviyesini ifade eder (daha yüksek sayılar daha yüksek öncelik anlamına gelir).
                                   
            1. Sorguda talep edilen gerçek bilgilere, tanımlara veya açıklamalara odaklanın.
            2. Kısa, net ve spesifik bilgiler sunmaya odaklanın.
            3. Açıklık için [b]önemli terimler[/b] ve tanımları ekleyin ve ilgili ayrıntıları vurgulayın.
            4. Genellemelerden kaçının; bağlamdan tam eşleşmeleri veya ilgili bilgileri çıkarmayı önceliklendirin.
            5. Cevap mümkün olduğunca kısa, net ve doğrudan olmalı; 150 ile 200 token arasında olmalıdır.
            
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

            [header]Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)
            [header]Başka Bir Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)

            Kurallar:  
            1. Her ana bölüm [header]...[/header] ile başlamalıdır  
            2. İçerikte önemli terimler veya vurgular için [b]...[/b] kullanın  
            3. Başlıklar şu kategorilerden biri olmalıdır: Tanım, Amaç, Temel Özellikler, İşleyiş, Bağlam
            4. Maddeler arasında ekstra olarak satır başı kullanmayın
            5. Sadece ana bölümler arasında satır başı kullanın

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu:
            {query}
            """)
        elif lang == "en" and intention == "Informational":
            return textwrap.dedent(f"""
            Your task is to analyze the given context windows, extract relevant data based on the user's query, and use file information to enhance your response. Your primary goal is to provide a comprehensive, structured, and user-friendly answer using solely the information provided in the context window.

            Instructions:
            You will be provided with context windows, each containing several sentences along with the two following metadata: 
            File: Specifies source of each context. 
            Confidence coefficient: A number between 0 and 1, indicating the priority of the context (higher numbers mean higher priority).

            1. Identify factual knowledge, definitions, or explanations requested in the query.
            2. Focus on delivering concise, clear, and specific information.
            3. Include [b]key terms[/b] and definitions for clarity and emphasize relevant details.
            4. Avoid generalizations; prioritize extracting exact matches or relevant information from the context.
            5. Answer must be short as possible, on-point and clear as much as possible and between 150 to 200 tokens.

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
            Do not mention about the 'context windows'. 'Use according to resources' instead.

            Respond *strictly* in the following format:

            [header]Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)
            [header]Another Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)

            Rules:
            1. Each major section must start with [header]...[/header]
            2. Use [bold]...[/bold] for important terms or emphasis within content
            3. Headers should be one of: Definition, Purpose, Key Features, Operation, Context
            4. Do not add extra line breaks between substances
            5. Only use line breaks between major sections                          
                                   
            Context Windows:
            {context}

            User Query:
            {query}
            """)
        elif lang == "tr" and intention == "Özetleme":
            return textwrap.dedent(f"""
            Göreviniz verilen bağlam pencerelerini analiz etmek, kullanıcının sorgusuna göre ilgili verileri çıkarmak ve yanıtınızı geliştirmek için dosya bilgilerini kullanmaktır. Birincil amacınız, yalnızca bağlam penceresinde sağlanan bilgileri kullanarak kapsamlı, yapılandırılmış ve kullanıcı dostu bir yanıt sunmaktır.

            Talimatlar:
            Size, her biri birkaç cümle ve şu iki meta veriyi içeren bağlam pencereleri sağlanacaktır:
            Dosya: Her bağlamın kaynağını belirtir.  
            Güven katsayısı: 0 ile 1 arasında bir sayı olup, bağlamın öncelik seviyesini ifade eder (daha yüksek sayılar daha yüksek öncelik anlamına gelir).
                                   
            1. Sorgu ile ilgili bağlamdan anahtar noktaları veya temel fikirleri belirleyin ve çıkarın.
            2. Netlik için madde işaretleri veya kategoriler kullanarak kısa ve iyi yapılandırılmış bir özet oluşturun.
            3. Genel temaları vurgulayın ve gereksiz ayrıntılara yer vermeden genel bir bakış sağlayın.
            4. Tekrarlamaları önlemek için bağlamlar arasındaki tutarlı bilgileri birleştirin.
            
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

            [header]Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)
            [header]Başka Bir Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)

            Kurallar:  
            1. Her ana bölüm [header]...[/header] ile başlamalıdır  
            2. İçerikte önemli terimler veya vurgular için [b]...[/b] kullanın  
            3. Başlıklar şu kategorilerden biri olmalıdır: Tanım, Amaç, Temel Özellikler, İşleyiş, Bağlam
            4. Maddeler arasında ekstra olarak satır başı kullanmayın
            5. Sadece ana bölümler arasında satır başı kullanın

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu:
            {query}
            """)
        elif lang == "en" and intention == "Summarization":
            return textwrap.dedent(f"""
            Your task is to analyze the given context windows, extract relevant data based on the user's query, and use file information to enhance your response. Your primary goal is to provide a comprehensive, structured, and user-friendly answer using solely the information provided in the context window.

            Instructions:
            You will be provided with context windows, each containing several sentences along with the two following metadata: 
            File: Specifies source of each context. 
            Confidence coefficient: A number between 0 and 1, indicating the priority of the context (higher numbers mean higher priority).

            1. Identify and extract key points or main ideas from the context relevant to the query.
            2. Create a concise and well-structured summary, using bullet points or categories for clarity.
            3. Highlight overarching themes and provide an overview without including excessive details.
            4. Consolidate consistent information across contexts to avoid redundancy.

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
            Do not mention about the 'context windows'. 'Use according to resources' instead.

            Respond *strictly* in the following format:

            [header]Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)
            [header]Another Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)

            Rules:
            1. Each major section must start with [header]...[/header]
            2. Use [bold]...[/bold] for important terms or emphasis within content
            3. Headers should be one of: Definition, Purpose, Key Features, Operation, Context
            4. Do not add extra line breaks between substances
            5. Only use line breaks between major sections                          
                                   
            Context Windows:
            {context}

            User Query:
            {query}
            """)
        elif lang == "tr" and intention == "Karşılaştırma":
            return textwrap.dedent(f"""
            Göreviniz verilen bağlam pencerelerini analiz etmek, kullanıcının sorgusuna göre ilgili verileri çıkarmak ve yanıtınızı geliştirmek için dosya bilgilerini kullanmaktır. Birincil amacınız, yalnızca bağlam penceresinde sağlanan bilgileri kullanarak kapsamlı, yapılandırılmış ve kullanıcı dostu bir yanıt sunmaktır.

            Talimatlar:
            Size, her biri birkaç cümle ve şu iki meta veriyi içeren bağlam pencereleri sağlanacaktır:
            Dosya: Her bağlamın kaynağını belirtir.  
            Güven katsayısı: 0 ile 1 arasında bir sayı olup, bağlamın öncelik seviyesini ifade eder (daha yüksek sayılar daha yüksek öncelik anlamına gelir).
                                   
            1. Benzerlikleri ve farklılıkları vurgulamak için bağlamdan ilgili detayları çıkarın ve karşılaştırın.
            2. Çelişkili bilgiler bulunursa, bu çelişkileri belirtin ve kaynaklarını açıklayın.
            3. Ayrımları veya paralellikleri, [header]Benzerlikler[/header] ve [header]Farklılıklar[/header] gibi başlıklar kullanarak yapılandırılmış bir formatta sunun.
            4. Çıkarılan bilgilerin kullanıcının sorgusuyla nasıl ilişkili olduğunu net bir şekilde açıklayın.
            
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

            [header]Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)
            [header]Başka Bir Bölüm Adı[/header]  
            İçerik, gerektiğinde [b]kalın terimler[/b] ile
            --madde eğer gerekliyse (ekstra satır başı olmadan)

            Kurallar:  
            1. Her ana bölüm [header]...[/header] ile başlamalıdır  
            2. İçerikte önemli terimler veya vurgular için [b]...[/b] kullanın  
            3. Başlıklar şu kategorilerden biri olmalıdır: Tanım, Amaç, Temel Özellikler, İşleyiş, Bağlam
            4. Maddeler arasında ekstra olarak satır başı kullanmayın
            5. Sadece ana bölümler arasında satır başı kullanın

            Bağlam Pencereleri:
            {context}

            Kullanıcı Sorgusu:
            {query}
            """)
        elif lang == "en" and intention == "Comparison":
            return textwrap.dedent(f"""
            Your task is to analyze the given context windows, extract relevant data based on the user's query, and use file information to enhance your response. Your primary goal is to provide a comprehensive, structured, and user-friendly answer using solely the information provided in the context window.

            Instructions:
            You will be provided with context windows, each containing several sentences along with the two following metadata: 
            File: Specifies source of each context. 
            Confidence coefficient: A number between 0 and 1, indicating the priority of the context (higher numbers mean higher priority).

            1. Extract and compare relevant details from the context to highlight similarities and differences.
            2. If contradictory information is found, specify the contradictions and explain their sources.
            3. Present distinctions or parallels in a structured format, using headers like [header]Similarities[/header] and [header]Differences[/header].
            4. Provide a clear explanation of how the extracted information relates to the user's query.

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
            Do not mention about the 'context windows'. 'Use according to resources' instead.

            Respond *strictly* in the following format:

            [header]Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)
            [header]Another Section Name[/header]
            Content with [bold]bold terms[/bold] when needed
            --substance when needed (without extra line breaks)

            Rules:
            1. Each major section must start with [header]...[/header]
            2. Use [bold]...[/bold] for important terms or emphasis within content
            3. Headers should be one of: Definition, Purpose, Key Features, Operation, Context
            4. Do not add extra line breaks between substances
            5. Only use line breaks between major sections                          
                                   
            Context Windows:
            {context}

            User Query:
            {query}
            """)

    def response_generation(self, query, context, intention):
        lang = self.detect_language(query=query)
        prompt = self._prompt_answer_generation(
            query=query, context=context, lang=lang, intention=intention
        )
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
