document.addEventListener('DOMContentLoaded', function() {
    let scrollTimeout;
    let isScrolling = false;
    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    let currentSection = 0;
    let lastScrollTime = 0;
    const translations = {
        EN: {
            landing: {
                login: "Log in",
                signup: "Sign Up",
                hero_title1: "Transform your",
                hero_title2: "files to AI powered ",
                hero_title3: "intelligent library.",
                hero_description1: "Manage all of your documentation in one place.",
                hero_description2: "PDFs, docs, excel tables and more ",
                hero_description3: "upload them into ragchat and make interactions faster",
                see_tutorial: "See the Tutorial",
                explore_now: "Explore Now",
                about_title: "What is ragchat?",
                upload_documents_title: "Upload Documents",
                upload_documents_description: "Upload your documents and transform them into an AI-powered intelligent library. Store up to 50MB of documents within your specialized domain folders. Currently supporting PDF, Word, and Text files.",
                chat_information_title: "Chat to Get Information",
                chat_information_description: "Chat with your documents through AI-powered natural conversations. Ask questions in everyday language and get instant, accurate answers from your document storage.",
                source_validation_title: "Source Validation",
                source_validation_description: "Get precise source validation for every answer with page numbers and direct references. Validate every step, save time and energy, and increase efficiency.",
                connected_documents_title: "Connected Documents",
                connected_documents_description: "Analyze relationships across multiple documents. Discover hidden connections between your files and make better decisions with AI-powered analysis.",
                demo_title: "See ragchat in Action",
                personal_researcher_title: "Your Personal Researcher",
                personal_researcher_description: "Supercharge your academic research with ragchat's intelligent document assistant. Instantly analyze multiple research papers, extract key findings, and generate comprehensive literature reviews through natural conversations. Perfect for academics, researchers, and students who need to process large volumes of scholarly work efficiently.",
                fast_analysis_title: "Fast and Accurate Analysis",
                fast_analysis_description: "Transform your business documents into actionable insights with ragchat. Instantly analyze financial reports, market research, and business metrics through natural conversations. Get precise data, track KPIs, and make data-driven decisions faster than ever.",
                smart_organization_title: "Smart Organization",
                smart_organization_description: "Transform your document management with ragchat's AI-powered smart organization. Create intelligent domains for your documents, instantly retrieve information through natural conversations, and maintain a self-organizing knowledge base that grows smarter with every addition. Perfect for teams handling extensive documentation and professionals dealing with large document collections.",
                info_title: "About Us",
                mission_title: "Mission",
                mission_description: "We're on a mission to revolutionize how people interact with information. At ragchat, we believe knowledge should be accessible, interactive, and intelligent.",
                who_we_are_title: "Who We Are",
                who_we_are_description: "Created by passionate engineers pushing the limits of AI and RAG technologies. Currently in beta, we're offering our complete platform free of charge.",
                what_we_do_title: "What We Do",
                what_we_do_description: "ragchat is your intelligent library, enabling natural conversations with your documents. Store up to 50MB and get instant, accurate answers.",
                contact_title: "Contact",
                contact_description: "Be part of our beta journey! Follow us on our social media accounts. Join our telegram group. We love to hear from you!",
                footer_desc: "Your AI powered intelligent library",
                footer: "&copy; 2024 ragchat. All rights reserved."
            },
            app: {
                select_domain: "Select Domain",
                upload_files: "Upload Files",
                upload_files_helper: "Select your domain first to upload files",
                profile: "Profile",
                settings: "Settings",
                go_premium: "Go Premium !",
                feedback: "Feedback",
                chat: "Chat",
                sources: "Sources",
                resources: "Resources",
                create_new_domain: "Create New Domain",
                delete_domain: "Delete Domain",
                delete_domain_question: "Are you sure you want to delete this domain?",
                cancel: "Cancel",
                delete: "Delete",
                selected_domain: "Selected Domain:",
                drag_drop: "Drag & Drop Files or",
                choose_files: "choose files",
                supported_file: "Supported file types: PDF, DOCX, XLSX, PPTX, UDF and TXT",
                premium_plan: "No Premium Plan Yet!",
                premium_text:  "We don't have a premium plan yet. You can you ragchat for free! Just don't forget to send us your feedbacks!",
                got_it: "Got It",
                send_feedback: "Send Feedback",
                type: "Type",
                type_general: "General Feedback",
                type_bug: "Bug Report",
                type_feature: "Feature Request",
                feedback_desc_1: "Your feedback really helps us get better!",
                feedback_desc_2: "Please follow these steps:",
                feedback_desc_3: "Select the type of your feedback",
                feedback_desc_4: "Add your description",
                feedback_desc_5: "If it helps explain better, attach a screenshot",
                feedback_screenshot: "Screenshot (Optional)",
                max_size_feedback:  "Max size: 2MB",
                cancel_button: "Cancel",
                submit_feedback: "Submit Feedback",
                please_desc: "Please describe your feedback or issue...",
                thankyou_message: "Thank You!",
                feedback_sumbited: "Your feedback has been successfully submitted. We appreciate your help in making ragchat better!",
                logout_title: "Log out of ragchat?",
                logout_alert: "You can always log back in at any time.",
                logout_button: "Log Out",
                logout_desc:  "You can always log back in at any time.",
                rating_title: "How would you rate ragchat?",
                sidebar_helper_text: "Select domain first on ⚙️",
                free_plan: "Free Plan",
                profile: "Profile",
                unselected: "Unselected",
                upload: "Upload",
                loading: "Loading...",
                uploading: "Uploading Files...",
                please_wait: "Please wait for ragchat to process your files",
                this_might: "This might take a moment depending on the size of your files",
                enter_domain_name: "Enter domain name",
                search_domains: "Search domains...",
                to_upload: "to upload",
                please_select: "Please select your domain from settings ⚙️ to start chat!",
                rating_modal_1: "How would you rate ragchat?",
                rating_modal_2: "Share your thoughts...",
                rating_modal_3: "Submit",
                find_your_answer: "Find your answer...",
                chat_place_holder: "Select your domain to start chat...",
                page: "Page",
                welcome: "Welcome",
                what_can: "what can I find for you?",
                welcome_to_ragchat: "Welcome to ragchat",
                welcome_to_ragchat_2: "I've automatically set up your first domain with helpful guide about using ragchat. You can always use this file to get any information about ragchat!\n[header]To get started[/header]\n- Ask any question about ragchat's features and capabilities \n- Try asking 'What can ragchat do?' or 'How do I organize my documents?'\n- The user guide has been uploaded to your first domain\n- All answers will include source references\n\n[header]Quick Tips[/header]\n- Open & close navigation bar by hovering\n- Click ⚙️ to manage domains and documents\n- Upload files via 'Upload Files' button after selecting a domain\n- Check right panel for answer sources\n- Supports PDF, DOCX, Excel, PowerPoint, UDF and TXT formats\n- Create different domains for different topics\n- View highlighted source sections in answers\n- Use file checkboxes to control search scope",
                chat_with: "Chat with",
                add_more_files: "Add More Files",
                files: "files"
            },
            login: {
                log_in: "LOG IN",
                sign_up: "Sign Up",
                password: "Password",
                login: "Log in",
                forgot_password: "Forgot password ?",
                or: "or",
                create_account: "Create new account",
            },
            signup: {   
                   login: "Log In",
                   sign_up: "Sign Up",
                   name: "Name",
                   surname: "Surname",
                   password: "Password",
                   already_have_account: "Already have an account ?",
                   log_in: "Log In",
            }
        },
        TR: {
            landing: {
                login: "Giriş Yap",
                signup: "Hesap Oluştur",
                hero_title1: "Dosyalarınızı",
                hero_title2: "yapay zeka destekli",
                hero_title3: "akıllı bir kütüphaneye dönüştürün.",
                hero_description1: "Tüm belgelerinizi tek bir yerde yönetin.",
                hero_description2: "PDF'ler, belgeler, Excel tabloları ve daha fazlası",
                hero_description3: "bunları ragchat'e yükleyin ve etkileşimleri hızlandırın.",
                see_tutorial: "Öğretici Videoyu İzle",
                explore_now: "Şimdi Keşfet",
                about_title: "ragchat Nedir?",
                upload_documents_title: "Belgelerini Yükle",
                upload_documents_description: "Belgelerinizi yükleyin ve bunları yapay zeka destekli bir akıllı kütüphaneye dönüştürün. Uzmanlaşmış alan klasörlerinizde 50MB’a kadar belge saklayın. Şu anda PDF, Word ve Metin dosyaları desteklenmektedir.",
                chat_information_title: "Sohbet Ederek Bilgi Al",
                chat_information_description: "Belgelerinizle yapay zeka destekli doğal konuşmalar aracılığıyla sohbet edin. Günlük dilde sorular sorun ve belge depolamanızdan anında, doğru yanıtlar alın.",
                source_validation_title: "Kaynak Doğrulama",
                source_validation_description: "Her yanıt için sayfa numaraları ve doğrudan referanslarla kesin kaynak doğrulaması alın. Her adımı doğrulayın, zaman ve enerji kazanın, verimliliği artırın.",
                connected_documents_title: "Bağlantılı Belgeler",
                connected_documents_description: "Birden fazla belge arasındaki ilişkileri analiz edin. Dosyalarınız arasındaki gizli bağlantıları keşfedin ve yapay zeka destekli analizle daha iyi kararlar alın.",
                demo_title: "ragchat'i İş Başında Görün",
                personal_researcher_title: "Kişisel Araştırmacınız",
                personal_researcher_description: "ragchat'in akıllı belge asistanıyla akademik araştırmanızı hızlandırın. Birden fazla araştırma makalesini anında analiz edin, önemli bulguları çıkarın ve doğal konuşmalar yoluyla kapsamlı literatür incelemeleri oluşturun. Geniş hacimli akademik çalışmaları verimli bir şekilde işlemeye ihtiyaç duyan akademisyenler, araştırmacılar ve öğrenciler için mükemmeldir.",
                fast_analysis_title: "Hızlı ve Doğru Analiz",
                fast_analysis_description: "İş belgelerinizi eyleme dönüştürülebilir içgörülere dönüştürün. Finansal raporları, pazar araştırmalarını ve iş metriklerini doğal konuşmalar aracılığıyla anında analiz edin. Kesin veriler alın, KPI'ları takip edin ve veri odaklı kararları daha hızlı alın.",
                smart_organization_title: "Akıllı Organizasyon",
                smart_organization_description: "ragchat'in yapay zeka destekli akıllı organizasyonu ile belge yönetiminizi dönüştürün. Belgeleriniz için akıllı alanlar oluşturun, doğal konuşmalar aracılığıyla bilgileri anında alın ve her ekleme ile daha akıllı hale gelen kendi kendini organize eden bir bilgi tabanını koruyun. Kapsamlı dokümantasyonlarla uğraşan ekipler ve geniş belge koleksiyonlarıyla çalışan profesyoneller için mükemmeldir.",
                info_title: "Hakkımızda",
                mission_title: "Misyon",
                mission_description: "Bilgiyle etkileşim kurma şeklini devrim niteliğinde değiştirmeyi hedefliyoruz. ragchat'te bilginin erişilebilir, etkileşimli ve akıllı olması gerektiğine inanıyoruz.",
                who_we_are_title: "Biz Kimiz",
                who_we_are_description: "AI ve RAG teknolojilerinin sınırlarını zorlayan tutkulu mühendisler tarafından oluşturuldu. Şu anda beta aşamasındayız ve platformumuzu ücretsiz sunuyoruz.",
                what_we_do_title: "Ne Yaparız",
                what_we_do_description: "ragchat, belgelerinizle doğal konuşmalar yapmanızı sağlayan akıllı kütüphanenizdir. 50MB’a kadar belge saklayın ve anında, doğru yanıtlar alın.",
                contact_title: "İletişim",
                contact_description: "Beta sürecimizin bir parçası olun! Sosyal medya hesaplarımızı takip edin. Telegram grubumuza katılın. Sizden haber almayı seviyoruz!",
                footer_desc: "Yapay Zeka Destekli Akıllı Kütüphaneniz",
                footer: "&copy; 2024 ragchat. Tüm hakları saklıdır."
            },
            app: {
                select_domain: "Domain Seçin",
                upload_files: "Dosya Yükle",
                upload_files_helper: "Dosyaları yüklemek için önce domain seçin",
                profile: "Profil",
                settings: "Ayarlar",
                go_premium: "Premium'a Geç !",
                feedback: "Geribildirim",
                chat: "Sohbet",
                sources: "Kaynak",
                resources: "Kaynaklar",
                create_new_domain: "Yeni Domain Oluştur",
                delete_domain: "Domaini Sil",
                delete_domain_question: "Bu domaini silmek istediğinizden emin misiniz?",
                cancel: "İptal",
                delete: "Sil",
                selected_domain: "Seçilen Domain:",
                drag_drop: "Dosyaları Sürükleyip Bırakın veya",
                choose_files: "Dosyaları Seçin",
                supported_file: "Desteklenen dosya türleri: PDF, DOCX, XLSX, PPTX, UDF ve TXT",
                premium_plan: "Henüz Premium Plan Yok!",
                premium_text: "Henüz bir premium planımız yok. ragchat'i ücretsiz kullanabilirsiniz! Sadece geri bildirimlerinizi bize göndermeyi unutmayın!",
                got_it: "Anlaşldı",
                send_feedback: "Geri Bildirim Gönder",
                type: "Tür",
                type_general: "Genel Geribildirim",
                type_bug: "Hata Raporu",
                type_feature: "Özellik İsteği",
                feedback_desc_1: "Geri bildiriminiz bize gerçekten daha iyi olmamıza yardımcı olur!",
                feedback_desc_2: "Lütfen bu adımları izleyin:",
                feedback_desc_3: "Geri bildiriminizin türünü seçin",
                feedback_desc_4: "Açıklamanızı ekleyin",
                feedback_desc_5: "Daha iyi açıklamaya yardımcı olursa ekran görüntüsü ekleyin",
                feedback_screenshot: "Ekran Görüntüsü (İsteğe Bağlı)",
                max_size_feedback: "Maksimum dosya boyutu: 2MB",
                cancel_button: "İptal",
                submit_feedback: "Geri Bildirim Gönder",
                thankyou_message: "Teşekkürler!",
                please_desc: "Lütfen geribildiriminizi yazın...",
                feedback_sumbited: "Geri bildiriminiz başarıyla gönderildi. ragchat'i daha iyi hale getirmemize yardımcı olduğunuz için teşekkür ederiz!",
                logout_title: "ragchat'ten çıkmak istiyor musunuz?",
                logout_alert: "Her zaman geri dönüp giriş yapabilirsiniz.",
                logout_button: "Çıkış Yap",
                logout_desc: "Her zaman geri dönüp giriş yapabilirsiniz.",
                rating_title: "ragchat'i Nasıl değerlendirirsiniz?",
                sidebar_helper_text: "İlk olarak ⚙️ ile domain seçin",
                free_plan: "Ücretsiz Plan",
                unselected: "Seçilmedi",
                upload: "Yükle",
                loading: "Yükleniyor...",
                uploading: "Dosyalar Yükleniyor...",
                please_wait: "Lütfen ragchat'in dosyalarınızı işlemesini bekleyin",
                this_might: "Bu, dosyalarınızın boyutuna bağlı olarak biraz zaman alabilir",
                enter_domain_name: "Domain ismi girin",
                search_domains: "Domain arayın...",
                to_upload: "yüklemek için",
                please_select: "Lütfen sohbete başlamak için ⚙️ ile domain seçiniz!",
                rating_modal_1: "ragchat'i Nasıl değerlendirirsiniz?",
                rating_modal_2: "Eleştirilerinizi paytlaşın...",
                rating_modal_3: "İlet",
                find_your_answer: "Cevabını bul...",
                chat_place_holder: "Sohbete başlamak için domain seç...",
                page: "Sayfa",
                welcome: "Hoşgeldin",
                what_can: "senin için ne yapabilirim?",
                welcome_to_ragchat: "ragchat'e Hoşgeldin",
                welcome_to_ragchat_2: "Ragchat kullanımıyla ilgili yararlı bir rehber içeren ilk alan adınızı otomatik olarak kurdum. Ragchat hakkında her türlü bilgiyi almak için her zaman bu dosyayı kullanabilirsiniz!\n[header]Başlamak için[/header]\n- Ragchat'in özellikleri ve yetenekleri hakkında istediğiniz soruyu sorun \n- 'Ragchat ne yapabilir?' diye sormayı deneyin. veya 'Belgelerimi nasıl düzenlerim?'\n- Kullanım kılavuzu ilk alanınıza yüklendi\n- Tüm yanıtlar kaynak referanslarını içerecektir\n\n[header]Hızlı İpuçları[/header]\n- Aç ve gezinme çubuğunu fareyle üzerine gelerek kapatın\n- Alanları ve belgeleri yönetmek için ⚙️ simgesini tıklayın\n- Bir alan seçtikten sonra 'Dosya Yükle' düğmesini kullanarak dosyaları yükleyin\n- Yanıt kaynakları için sağ paneli kontrol edin\n- PDF, DOCX, Excel, PowerPoint'i destekler , UDF ve TXT biçimleri\n- Farklı konular için farklı alanlar oluşturun\n- Yanıtlarda vurgulanan kaynak bölümlerini görüntüleyin\n- Arama kapsamını kontrol etmek için dosya onay kutularını kullanın",
                chat_with: "Sohbet et",
                add_more_files: "Dosya Ekle",
                files: "dosya"
            },
            login: {
                log_in: "GİRİŞ YAP",
                sign_up: "Hesap Oluştur",
                password: "Şifre",
                login: "Giriş Yap",
                forgot_password: "Şifrenizi mi unuttunuz ?",
                or: "veya",
                create_account: "Yeni hesap oluştur"
            },
            signup: {  
                login: "Giriş Yap",
                sign_up: "Hesap Oluştur",
                name: "İsim",
                surname: "Soyisim",
                password: "Şifre",
                already_have_account: "Zaten bir hesabınız var mı ?",
                log_in: "Giriş Yap",
            }
        },
        DE: {
            landing: {
                login: "Anmelden",
                signup: "Registrieren",
                hero_title1: "Transformieren Sie Ihre",
                hero_title2: "Dateien in eine KI-gestützte",
                hero_title3: "intelligente Bibliothek.",
                hero_description1: "Verwalten Sie Ihre gesamte Dokumentation an einem Ort.",
                hero_description2: "PDFs, Dokumente, Excel-Tabellen und mehr",
                hero_description3: "laden Sie sie in ragchat hoch und beschleunigen Sie die Interaktionen.",
                see_tutorial: "Tutorial ansehen",
                explore_now: "Jetzt erkunden",
                about_title: "Was ist ragchat?",
                upload_documents_title: "Dokumente hochladen",
                upload_documents_description: "Laden Sie Ihre Dokumente hoch und verwandeln Sie sie in eine KI-gestützte intelligente Bibliothek. Speichern Sie bis zu 50 MB an Dokumenten in Ihren speziellen Domänenordnern. Derzeit werden PDF-, Word- und Textdateien unterstützt.",
                chat_information_title: "Chatten, um Informationen zu erhalten",
                chat_information_description: "Chatten Sie mit Ihren Dokumenten durch natürliche KI-gestützte Gespräche. Stellen Sie Fragen in Alltagssprache und erhalten Sie sofort genaue Antworten aus Ihrem Dokumentenspeicher.",
                source_validation_title: "Quellenvalidierung",
                source_validation_description: "Erhalten Sie eine präzise Quellenüberprüfung mit Seitenzahlen und direkten Referenzen für jede Antwort. Überprüfen Sie jeden Schritt, sparen Sie Zeit und Energie und steigern Sie die Effizienz.",
                connected_documents_title: "Verknüpfte Dokumente",
                connected_documents_description: "Analysieren Sie Beziehungen zwischen mehreren Dokumenten. Entdecken Sie versteckte Verbindungen zwischen Ihren Dateien und treffen Sie bessere Entscheidungen mit KI-gestützter Analyse.",
                demo_title: "Erleben Sie ragchat in Aktion",
                personal_researcher_title: "Ihr persönlicher Forscher",
                personal_researcher_description: "Beschleunigen Sie Ihre akademische Forschung mit dem intelligenten Dokumentenassistenten von Ragchat. Analysieren Sie sofort mehrere Forschungsarbeiten, extrahieren Sie wichtige Erkenntnisse und erstellen Sie durch natürliche Gespräche umfassende Literaturrezensionen. Perfekt für Akademiker, Forscher und Studenten, die große Mengen akademischer Arbeit effizient bearbeiten müssen.",
                fast_analysis_title: "Schnelle und präzise Analyse",
                fast_analysis_description: "Verwandeln Sie Ihre Geschäftsdokumente in umsetzbare Erkenntnisse. Analysieren Sie Finanzberichte, Marktforschung und Geschäftskennzahlen sofort durch natürliche Gespräche. Erhalten Sie genaue Daten, verfolgen Sie KPIs und treffen Sie datengesteuerte Entscheidungen schneller.",
                smart_organization_title: "Intelligente Organisation",
                smart_organization_description: "Transformieren Sie Ihr Dokumentenmanagement mit der KI-gestützten intelligenten Organisation von Ragchat. Erstellen Sie intelligente Bereiche für Ihre Dokumente, rufen Sie Informationen sofort durch natürliche Gespräche ab und pflegen Sie eine selbstorganisierende Wissensdatenbank, die mit jeder Ergänzung intelligenter wird. Perfekt für Teams, die mit umfangreicher Dokumentation arbeiten, und Profis, die mit großen Dokumentensammlungen arbeiten.",
                info_title: "Über uns",
                mission_title: "Mission",
                mission_description: "Wir bei Ragchat sind davon überzeugt, dass Informationen zugänglich, interaktiv und intelligent sein sollten.",
                who_we_are_title: "Wer wir sind",
                who_we_are_description: "Erstellt von leidenschaftlichen Ingenieuren, die die Grenzen der KI- und RAG-Technologien erweitern. Derzeit in der Betaphase bieten wir unsere komplette Plattform kostenlos an.",
                what_we_do_title: "Was wir tun",
                what_we_do_description: "Ragchat ist Ihre intelligente Bibliothek, mit der Sie natürliche Gespräche mit Ihren Dokumenten führen können. Speichern Sie bis zu 50 MB an Dokumenten und erhalten Sie sofort genaue Antworten.",
                contact_title: "Kontakt",
                contact_description: "Seien Sie Teil unseres Beta-Prozesses! Folgen Sie unseren Social-Media-Konten. Treten Sie unserer Telegram-Gruppe bei. Wir freuen uns, von Ihnen zu hören!",
                footer_desc: "Ihre KI-gestützte intelligente Bibliothek",
                footer: "&copy; 2024 ragchat. Alle Rechte vorbehalten."
            },
            app: {
                select_domain: "Domäne auswählen",
                upload_files: "Dateien hochladen",
                upload_files_helper: "Wählen Sie zuerst Ihre Domäne, um Dateien hochzuladen",
                profile: "Profil",
                settings: "Einstellungen",
                go_premium: "Premium werden",
                feedback: "Feedback",
                chat: "Chat",
                sources: "Quellen",
                resources: "Ressourcen",
                create_new_domain: "Neue Domäne erstellen",
                delete_domain: "Domäne löschen",
                delete_domain_question: "Sind Sie sicher, dass Sie diese Domäne löschen möchten?",
                cancel: "Abbrechen",
                delete: "Löschen",
                selected_domain: "Ausgewählte Domäne",
                drag_drop: "Dateien per Drag & Drop verschieben oder",
                choose_files: "Dateien auswählen",
                supported_file: "Unterstützte Dateitypen: PDF, Word, Text",
                premium_plan: "Noch kein Premium-Plan!",
                premium_text: "Wir haben noch keinen Premium-Plan. Sie können ragchat kostenlos nutzen! Bitte vergessen Sie nicht, uns Ihr Feedback zu senden!",
                got_it: "Verstanden",
                send_feedback: "Feedback senden",
                type: "Type",
                type_general: "Allgemeines Feedback",
                type_bug: "Fehlermeldung",
                type_feature: "Feature-Anfrage",
                feedback_desc_1: "Ihr Feedback hilft uns wirklich, besser zu werden!",
                feedback_desc_2: "Bitte folgen Sie diesen Schritten:",
                feedback_desc_3: "Wählen Sie den Typ Ihres Feedbacks",
                feedback_desc_4: "Fügen Sie Ihre Beschreibung hinzu",
                feedback_desc_5: "Fügen Sie ggf. einen Screenshot bei, um es besser zu erklären",
                feedback_screenshot: "Screenshot (optional)",
                max_size_feedback: "Maximale Größe: 2MB",
                cancel_button: "Abbrechen",
                please_desc: "Bitte geben Sie Ihr Feedback ein...",
                submit_feedback: "Feedback einreichen",
                thankyou_message: "Vielen Dank!",
                feedback_sumbited: "Ihr Feedback wurde erfolgreich eingereicht. Wir schätzen Ihre Hilfe, ragchat besser zu machen!",
                logout_title: "Von ragchat abmelden?",
                logout_alert: "Sie können sich jederzeit wieder anmelden.",
                logout_button: "Abmelden",
                logout_desc: "Sie können sich jederzeit wieder anmelden.",
                rating_title: "Wie würden Sie ragchat bewerten?",
                sidebar_helper_text: "Wählen Sie zuerst eine Domain in den ⚙️-Einstellungen",
                free_plan: "Kostenloser Plan",
                unselected: "Nicht ausgewählt",
                upload: "Hochladen",
                loading: "Wird geladen...",
                uploading: "Dateien hochladen...",
                please_wait: "Bitte warten Sie, während ragchat Ihre Dateien verarbeitet",
                this_might: "Das könnte je nach Dateigröße einen Moment dauern",
                enter_domain_name: "Domainnamen eingeben",
                search_domains: "Domains durchsuchen...",
                to_upload: "zum Hochladen",
                please_select: "Wählen Sie zuerst Ihre Domain, um zu chatten ⚙️!",
                please_select: "Bitte wählen Sie zuerst Ihre Domain in den ⚙️-Einstellungen, um zu chatten!",
                rating_modal_1: "Wie bewerten Sie ragchat?",
                rating_modal_2: "Teilen Sie uns Ihre Gedanken mit...",
                rating_modal_3: "Absenden",
                find_your_answer: "Finden Sie Ihre Antwort...",
                chat_place_holder: "Wählen Sie Ihre Domain, um mit dem Chat zu beginnen...",
                page: "Seite",
                welcome: "Willkommen",
                what_can: "Was kann ich für Sie finden?",
                welcome_to_ragchat: "Willkommen bei ragchat",
                welcome_to_ragchat_2: "Ich habe automatisch Ihre erste Domain mit einer hilfreichen Anleitung für die Nutzung von ragchat eingerichtet. Sie können diese Datei jederzeit verwenden, um Informationen über ragchat zu erhalten!\n[header]Erste Schritte[/header]\n- Stellen Sie jede Frage zu den Funktionen und Fähigkeiten von ragchat\n- Versuchen Sie es mit 'Was kann ragchat tun?' oder 'Wie organisiere ich meine Dokumente?'\n- Die Benutzeranleitung wurde in Ihre erste Domain hochgeladen\n- Alle Antworten enthalten Quellverweise\n\n[header]Schnelle Tipps[/header]\n- Öffnen & schließen Sie die Navigationsleiste durch Hover-Effekte\n- Klicken Sie auf ⚙️, um Domains und Dokumente zu verwalten\n- Laden Sie Dateien über den Button 'Dateien hochladen' nach Auswahl einer Domain hoch\n- Prüfen Sie die rechte Seite für Quellverweise\n- Unterstützte Formate: PDF, DOCX, Excel, PowerPoint, UDF und TXT\n- Erstellen Sie verschiedene Domains für unterschiedliche Themen\n- Sehen Sie hervorgehobene Quellenabschnitte in Antworten ein\n- Verwenden Sie Dateiauswahlkästchen, um den Suchbereich zu steuern",
                chat_with: "Chatten mit",
                add_more_files: "Weitere Dateien hinzufügen",
                files: "Dateien"
            },
            login: {
                log_in: "ANMELDEN",
                sign_up: "Registrieren",
                password: "Passwort",
                login: "Anmelden",
                forgot_password: "Passwort vergessen?",
                or: "oder",
                create_account: "Neues Konto erstellen",
            },
            signup: {   
                login: "Anmelden",
                sign_up: "Registrieren",
                name: "Name",
                surname: "Nachname",
                password: "Passwort",
                already_have_account: "Haben Sie bereits ein Konto?",
                log_in: "Anmelden",
            }
        },
        FR: {
            landing: {
                login: "Connexion",
                signup: "S'inscrire",
                hero_title1: "Transformez vos",
                hero_title2: "fichiers en une bibliothèque",
                hero_title3: "intelligente alimentée par l'IA.",
                hero_description1: "Gérez toute votre documentation en un seul endroit.",
                hero_description2: "PDFs, documents, tableaux Excel et bien plus",
                hero_description3: "téléchargez-les dans ragchat pour des interactions plus rapides.",
                see_tutorial: "Voir le tutoriel",
                explore_now: "Explorer maintenant",
                about_title: "Qu'est-ce que ragchat?",
                upload_documents_title: "Téléchargez des documents",
                upload_documents_description: "Téléchargez vos documents et transformez-les en une bibliothèque intelligente alimentée par l'IA. Stockez jusqu'à 50 Mo de documents dans vos dossiers de domaine spécialisés. Actuellement, les fichiers PDF, Word et Texte sont pris en charge.",
                chat_information_title: "Discutez pour obtenir des informations",
                chat_information_description: "Discutez avec vos documents via des conversations naturelles basées sur l'IA. Posez des questions dans un langage courant et obtenez des réponses instantanées et précises à partir de votre stockage de documents.",
                source_validation_title: "Validation des sources",
                source_validation_description: "Obtenez une vérification précise de la source avec des numéros de page et des références directes pour chaque réponse. Vérifiez chaque étape, économisez du temps et de l’énergie, augmentez l’efficacité.",
                connected_documents_title: "Documents connectés",
                connected_documents_description: "Analysez les relations entre plusieurs documents. Découvrez les connexions cachées entre vos fichiers et prenez de meilleures décisions grâce à une analyse basée sur l'IA.",
                demo_title: "Voir ragchat en action",
                personal_researcher_title: "Votre chercheur personnel",
                personal_researcher_description: "Accélérez vos recherches universitaires avec l'assistant de documents intelligent de ragchat. Analysez instantanément plusieurs articles de recherche, extrayez les principales conclusions et créez des analyses documentaires complètes grâce à des conversations naturelles. Parfait pour les universitaires, les chercheurs et les étudiants qui ont besoin de traiter efficacement de gros volumes de travaux académiques.",
                fast_analysis_title: "Analyse rapide et précise",
                fast_analysis_description: "Transformez vos documents professionnels en informations exploitables. Analysez instantanément les rapports financiers, les études de marché et les indicateurs commerciaux grâce à des conversations naturelles. Obtenez des données précises, suivez les KPI et prenez plus rapidement des décisions basées sur les données.",
                smart_organization_title: "Organisation intelligente",
                smart_organization_description: "Transforme su gestión de documentos con la organización inteligente impulsada por IA de ragchat. Cree espacios inteligentes para sus documentos, recupere información instantáneamente a través de conversaciones naturales y mantenga una base de conocimientos autoorganizada que se vuelve más inteligente con cada adición. Perfecto para equipos que trabajan con documentación extensa y profesionales que trabajan con grandes colecciones de documentos.",
                info_title: "À propos",
                mission_title: "Mission",
                mission_description: "Nous visons à révolutionner la façon dont nous interagissons avec l’information. Chez ragchat, nous pensons que l'information doit être accessible, interactive et intelligente.",
                who_we_are_title: "Qui sommes-nous?",
                who_we_are_description: "Créé par des ingénieurs passionnés repoussant les limites des technologies IA et RAG. Nous sommes actuellement en phase bêta et proposons notre plateforme gratuitement.",
                what_we_do_title: "Ce que nous faisons",
                what_we_do_description: "ragchat est votre bibliothèque intelligente qui vous permet d'avoir des conversations naturelles avec vos documents. Stockez jusqu'à 50 Mo de documents et obtenez des réponses instantanées et précises.",
                contact_title: "Contact",
                contact_description: "Faites partie de notre processus bêta ! Suivez nos comptes de médias sociaux. Rejoignez notre groupe Telegram. Nous aimons avoir de vos nouvelles !",
                footer_desc: "Votre bibliothèque intelligente alimentée par l'IA",
                footer: "&copy; 2024 ragchat. Tous droits réservés."
            },
            app: {
                select_domain: "Sélectionner un domaine",
                upload_files: "Télécharger des fichiers",
                upload_files_helper: "Sélectionnez d'abord votre domaine pour télécharger des fichiers",
                profile: "Profil",
                settings: "Paramètres",
                go_premium: "Passer en Premium",
                feedback: "Retour",
                chat: "Chat",
                sources: "Sources",
                resources: "Ressources",
                create_new_domain: "Créer un nouveau domaine",
                delete_domain: "Supprimer le domaine",
                delete_domain_question: "Êtes-vous sûr de vouloir supprimer ce domaine?",
                cancel: "Annuler",
                delete: "Supprimer",
                selected_domain: "Domaine sélectionné",
                drag_drop: "Glisser-déposer les fichiers ou",
                choose_files: "choisissez des fichiers",
                supported_file: "Types de fichiers pris en charge : PDF, Word, Texte",
                premium_plan: "Pas encore de plan Premium!",
                premium_text: "Nous n'avons pas encore de plan Premium. Vous pouvez utiliser ragchat gratuitement! N'oubliez pas de nous envoyer vos retours!",
                got_it: "J'ai compris",
                send_feedback: "Envoyer des commentaires",
                type: "Type",
                type_general: "Retour général",
                type_bug: "Rapport de bug",
                type_feature: "Demande de fonctionnalité",
                feedback_desc_1: "Vos retours nous aident vraiment à nous améliorer!",
                feedback_desc_2: "Veuillez suivre ces étapes:",
                feedback_desc_3: "Sélectionnez le type de vos retours",
                feedback_desc_4: "Ajoutez votre description",
                feedback_desc_5: "Joignez une capture d'écran si cela peut aider à mieux expliquer",
                feedback_screenshot: "Capture d'écran (optionnel)",
                max_size_feedback: "Taille maximale : 2MB",
                cancel_button: "Annuler",
                submit_feedback: "Soumettre des commentaires",
                thankyou_message: "Merci!",
                feedback_sumbited: "Vos retours ont été soumis avec succès. Nous apprécions votre aide pour améliorer ragchat!",
                logout_title: "Se déconnecter de ragchat?",
                logout_alert: "Vous pouvez vous reconnecter à tout moment.",
                logout_button: "Se déconnecter",
                logout_desc: "Vous pouvez vous reconnecter à tout moment.",
                rating_title: "Comment évalueriez-vous ragchat?",
                sidebar_helper_text: "Sélectionnez d'abord un domaine sur ⚙️",
                free_plan: "Plan gratuit",
                unselected: "Non sélectionné",
                upload: "Télécharger",
                please_desc: "Veuillez écrire vos commentaires...",
                loading: "Chargement...",
                uploading: "Téléchargement des fichiers...",
                please_wait: "Veuillez patienter pendant que ragchat traite vos fichiers",
                this_might: "Cela peut prendre un moment selon la taille de vos fichiers",
                enter_domain_name: "Saisir le nom du domaine",
                search_domains: "Rechercher des domaines...",
                to_upload: "pour télécharger",
                please_select: "Veuillez sélectionner votre domaine dans les paramètres ⚙️ pour commencer à discuter !",
                rating_modal_1: "Comment évalueriez-vous ragchat ?",
                rating_modal_2: "Partagez vos pensées...",
                rating_modal_3: "Soumettre",
                find_your_answer: "Trouvez votre réponse...",
                chat_place_holder: "Sélectionnez votre domaine pour commencer à discuter...",
                page: "Page",
                welcome: "Bienvenue",
                what_can: "Que puis-je trouver pour vous ?",
                welcome_to_ragchat: "Bienvenue sur ragchat",
                welcome_to_ragchat_2: "J'ai configuré automatiquement votre premier domaine avec un guide utile sur l'utilisation de ragchat. Vous pouvez toujours utiliser ce fichier pour obtenir des informations sur ragchat !\n[header]Pour commencer[/header]\n- Posez n'importe quelle question sur les fonctionnalités et capacités de ragchat\n- Essayez de demander 'Que peut faire ragchat ?' ou 'Comment organiser mes documents ?'\n- Le guide de l'utilisateur a été téléchargé dans votre premier domaine\n- Toutes les réponses incluront des références aux sources\n\n[header]Conseils rapides[/header]\n- Ouvrez et fermez la barre de navigation en survolant\n- Cliquez sur ⚙️ pour gérer les domaines et documents\n- Téléchargez des fichiers via le bouton 'Télécharger des fichiers' après avoir sélectionné un domaine\n- Consultez le panneau droit pour les sources des réponses\n- Formats pris en charge : PDF, DOCX, Excel, PowerPoint, UDF et TXT\n- Créez différents domaines pour différents sujets\n- Consultez les sections des sources mises en évidence dans les réponses\n- Utilisez les cases à cocher des fichiers pour contrôler l'étendue de la recherche",
                chat_with: "Discuter avec",
                add_more_files: "Ajouter plus de fichiers",
                files: "fichiers"
            },
            login: {
                log_in: "SE CONNECTER",
                sign_up: "S'inscrire",
                password: "Mot de passe",
                login: "Se connecter",
                forgot_password: "Mot de passe oublié ?",
                or: "ou",
                create_account: "Créer un nouveau compte",
            },
            signup: {   
                login: "Se connecter",
                sign_up: "S'inscrire",
                name: "Nom",
                surname: "Prénom",
                password: "Mot de passe",
                already_have_account: "Vous avez déjà un compte?",
                log_in: "Se connecter",
            }
        },
        ES: {
            landing: {
                login: "Iniciar sesión",
                signup: "Regístrate",
                hero_title1: "Transforma tus",
                hero_title2: "archivos en una biblioteca",
                hero_title3: "inteligente impulsada por IA.",
                hero_description1: "Administra toda tu documentación en un solo lugar.",
                hero_description2: "PDFs, documentos, tablas de Excel y más",
                hero_description3: "súbelos a ragchat y haz que las interacciones sean más rápidas.",
                see_tutorial: "Ver el tutorial",
                explore_now: "Explorar ahora",
                about_title: "¿Qué es ragchat?",
                upload_documents_title: "Subir documentos",
                upload_documents_description: "Cargue sus documentos y conviértalos en una biblioteca inteligente impulsada por IA. Almacene hasta 50 MB de documentos en las carpetas de su dominio especializado. Actualmente se admiten archivos PDF, Word y Texto.",
                chat_information_title: "Chatea para obtener información",
                chat_information_description: "Chatea con tus documentos a través de conversaciones naturales impulsadas por IA. Haga preguntas en lenguaje cotidiano y obtenga respuestas instantáneas y precisas desde su almacenamiento de documentos.",
                source_validation_title: "Validación de fuentes",
                source_validation_description: "Obtenga una verificación de fuente precisa con números de página y referencias directas para cada respuesta. Verifique cada paso, ahorre tiempo y energía, aumente la eficiencia.",
                connected_documents_title: "Documentos conectados",
                connected_documents_description: "Analizar las relaciones entre múltiples documentos. Descubra vínculos ocultos entre sus archivos y tome mejores decisiones con análisis impulsado por IA",
                demo_title: "Ver ragchat en acción",
                personal_researcher_title: "Tu investigador personal",
                personal_researcher_description: "Acelere su investigación académica con el asistente de documentos inteligente de ragchat. Analice instantáneamente múltiples artículos de investigación, extraiga hallazgos clave y cree revisiones bibliográficas integrales a través de conversaciones naturales. Perfecto para académicos, investigadores y estudiantes que necesitan procesar grandes volúmenes de trabajo académico de manera eficiente.",
                fast_analysis_title: "Análisis rápido y preciso",
                fast_analysis_description: "Convierta sus documentos comerciales en información útil. Analice instantáneamente informes financieros, investigaciones de mercado y métricas comerciales a través de conversaciones naturales. Obtenga datos precisos, realice un seguimiento de los KPI y tome decisiones basadas en datos más rápido.",
                smart_organization_title: "Organización inteligente",
                smart_organization_description: "Transforme su gestión de documentos con la organización inteligente impulsada por IA de ragchat. Cree espacios inteligentes para sus documentos, recupere información instantáneamente a través de conversaciones naturales y mantenga una base de conocimientos autoorganizada que se vuelve más inteligente con cada adición. Perfecto para equipos que trabajan con documentación extensa y profesionales que trabajan con grandes colecciones de documentos.",
                info_title: "Sobre nosotros",
                mission_title: "Misión",
                mission_description: "Nuestro objetivo es revolucionar la forma en que interactuamos con la información. En ragchat creemos que la información debe ser accesible, interactiva e inteligente.",
                who_we_are_title: "¿Quiénes somos?",
                who_we_are_description: "Creado por ingenieros apasionados que traspasan los límites de las tecnologías AI y RAG. Actualmente estamos en fase beta y ofrecemos nuestra plataforma de forma gratuita.",
                what_we_do_title: "Lo que hacemos",
                what_we_do_description: "ragchat es tu biblioteca inteligente que te permite tener conversaciones naturales con tus documentos. Almacene hasta 50 MB de documentos y obtenga respuestas precisas e instantáneas.",
                contact_title: "Contacto",
                contact_description: "¡Sé parte de nuestro proceso beta! Sigue nuestras cuentas de redes sociales. Únete a nuestro grupo de Telegram. ¡Nos encanta saber de usted!",
                footer_desc: "Tu biblioteca inteligente impulsada por IA",
                footer: "&copy; 2024 ragchat. Todos los derechos reservados."
            },
            app: {
                select_domain: "Seleccionar dominio",
                upload_files: "Subir archivos",
                upload_files_helper: "Primero seleccione su dominio para cargar archivos",
                profile: "Perfil",
                settings: "Configuraciones",
                go_premium: "Hazte Premium",
                feedback: "Retroalimentación",
                chat: "Chat",
                sources: "Fuentes",
                resources: "Recursos",
                create_new_domain: "Crear un nuevo dominio",
                delete_domain: "Eliminar dominio",
                delete_domain_question: "¿Está seguro de que desea eliminar este dominio?",
                cancel: "Cancelar",
                delete: "Eliminar",
                selected_domain: "Dominio seleccionado",
                drag_drop: "Arrastra y suelta archivos o",
                choose_files: "elige archivos",
                supported_file: "Tipos de archivos compatibles: PDF, Word, Texto",
                premium_plan: "¡Aún no hay plan Premium!",
                premium_text: "Todavía no tenemos un plan Premium. ¡Puedes usar ragchat gratis! Solo asegúrate de enviarnos tus comentarios!",
                got_it: "Entendido",
                send_feedback: "Enviar comentarios",
                type: "Tipo",
                type_general: "Comentarios generales",
                type_bug: "Informe de errores",
                type_feature: "Solicitud de función",
                feedback_desc_1: "¡Tus comentarios realmente nos ayudan a mejorar!",
                feedback_desc_2: "Siga estos pasos:",
                feedback_desc_3: "Selecciona el tipo de tus comentarios",
                feedback_desc_4: "Agrega tu descripción",
                feedback_desc_5: "Si ayuda a explicar mejor, adjunta una captura de pantalla",
                feedback_screenshot: "Captura de pantalla (opcional)",
                max_size_feedback: "Tamaño máximo: 2MB",
                cancel_button: "Cancelar",
                submit_feedback: "Enviar comentarios",
                thankyou_message: "¡Gracias!",
                please_desc: "Por favor, escriba sus comentarios...",
                feedback_sumbited: "Tus comentarios se han enviado con éxito. ¡Agradecemos tu ayuda para mejorar ragchat!",
                logout_title: "¿Cerrar sesión en ragchat?",
                logout_alert: "Siempre puedes volver a iniciar sesión en cualquier momento.",
                logout_button: "Cerrar sesión",
                logout_desc: "Siempre puedes volver a iniciar sesión en cualquier momento.",
                rating_title: "¿Cómo calificarías ragchat?",
                sidebar_helper_text: "Seleccione primero un dominio en ⚙️",
                free_plan: "Plan gratuito",
                unselected: "No seleccionado",
                upload: "Subir",
                loading: "Cargando...",
                uploading: "Subiendo archivos...",
                please_wait: "Espere mientras ragchat procesa sus archivos",
                this_might: "Esto podría tomar un momento dependiendo del tamaño de sus archivos",
                enter_domain_name: "Ingrese el nombre del dominio",
                search_domains: "Buscar dominios...",
                to_upload: "para subir",
                please_select: "¡Seleccione su dominio en la configuración ⚙️ para comenzar a chatear!",
                rating_modal_1: "¿Cómo calificaría ragchat?",
                rating_modal_2: "Comparta sus pensamientos...",
                rating_modal_3: "Enviar",
                find_your_answer: "Encuentra tu respuesta...",
                chat_place_holder: "Seleccione su dominio para comenzar a chatear...",
                page: "Página",
                welcome: "Bienvenido",
                what_can: "¿Qué puedo encontrar para ti?",
                welcome_to_ragchat: "Bienvenido a ragchat",
                welcome_to_ragchat_2: "He configurado automáticamente su primer dominio con una guía útil sobre cómo usar ragchat. ¡Siempre puede usar este archivo para obtener cualquier información sobre ragchat!\n[header]Para comenzar[/header]\n- Haga cualquier pregunta sobre las funciones y capacidades de ragchat\n- Intente preguntar '¿Qué puede hacer ragchat?' o '¿Cómo organizo mis documentos?'\n- La guía del usuario se ha subido a su primer dominio\n- Todas las respuestas incluirán referencias a las fuentes\n\n[header]Consejos rápidos[/header]\n- Abra y cierre la barra de navegación con el cursor\n- Haga clic en ⚙️ para administrar dominios y documentos\n- Suba archivos a través del botón 'Subir archivos' después de seleccionar un dominio\n- Consulte el panel derecho para las fuentes de las respuestas\n- Formatos compatibles: PDF, DOCX, Excel, PowerPoint, UDF y TXT\n- Cree diferentes dominios para diferentes temas\n- Vea secciones de fuentes destacadas en las respuestas\n- Use las casillas de verificación de archivos para controlar el alcance de la búsqueda",
                chat_with: "Chatear con",
                add_more_files: "Agregar más archivos",
                files: "archivos"
            },
            login: {
                log_in: "INICIAR SESIÓN",
                sign_up: "Regístrate",
                password: "Contraseña",
                login: "Iniciar sesión",
                forgot_password: "¿Olvidaste tu contraseña?",
                or: "o",
                create_account: "Crear una nueva cuenta",
            },
            signup: {   
                login: "Iniciar sesión",
                sign_up: "Regístrate",
                name: "Nombre",
                surname: "Apellido",
                password: "Contraseña",
                already_have_account: "¿Ya tienes una cuenta?",
                log_in: "Iniciar sesión",
            }
        }
    };

    window.translations = translations;

    function isLargeScreen() {
        return window.innerWidth >= 992;
    }

    function isTablet() {
        return window.innerWidth >= 992 && window.innerWidth <= 1200;
    }

    function updateScrollBehavior() {
        if (isTablet()) {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            
            document.querySelectorAll('.section').forEach(section => {
                section.style.height = 'auto';
                section.style.minHeight = 'auto';
            });
        } else if (isLargeScreen()) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'visible';
        } else {
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
    }

    function smoothScrollTo(element, duration = 300) {
        if (!isLargeScreen() || isTablet()) {
            element.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                setTimeout(() => {
                    isScrolling = false;
                    lastScrollTime = Date.now();
                }, 50);
            }
        }

        requestAnimationFrame(animation);
    }

    // Function to show tutorial (add this new function)
    function showTutorial() {
        const demoSection = document.getElementById('demo');
        
        if (demoSection) {
            // Find the index of the demo section
            const demoSectionIndex = Array.from(sections).indexOf(demoSection);
            
            // Update current section for smooth scrolling behavior
            currentSection = demoSectionIndex;
            
            // Scroll to demo section
            smoothScrollTo(demoSection);
        }
    }

    // Add event listener for the tutorial button
    const tutorialButton = document.querySelector('button[onclick="showTutorial()"]');
    if (tutorialButton) {
        tutorialButton.addEventListener('click', showTutorial);
    }

    window.addEventListener('wheel', function(e) {
        if (!isLargeScreen() || isTablet()) return;

        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;

        if (timeSinceLastScroll < 80) return;

        const isFooterVisible = footer.getBoundingClientRect().top < window.innerHeight;
        const isLastSection = currentSection === sections.length - 1;

        if (isLastSection && e.deltaY > 0 && !isFooterVisible) {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            footer.scrollIntoView({ behavior: 'smooth' });
            lastScrollTime = now;
            return;
        }

        if (isFooterVisible && e.deltaY < 0) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            smoothScrollTo(sections[sections.length - 1]);
            lastScrollTime = now;
            return;
        }

        if (!isScrolling) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = true;

                if (e.deltaY > 0 && currentSection < sections.length - 1) {
                    currentSection++;
                    smoothScrollTo(sections[currentSection]);
                } else if (e.deltaY < 0 && currentSection > 0) {
                    currentSection--;
                    smoothScrollTo(sections[currentSection]);
                } else {
                    isScrolling = false;
                }

                lastScrollTime = now;
            }, 10);
        }
    }, { passive: false });

    let touchStartY;
    
    window.addEventListener('touchstart', function(e) {
        if (!isLargeScreen() || isTablet()) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
        if (!isLargeScreen() || isTablet()) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 30) {
            const event = new WheelEvent('wheel', {
                deltaY: deltaY
            });
            window.dispatchEvent(event);
        }
    }, { passive: true });

    // Fade efekti
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    updateScrollBehavior();
    window.addEventListener('resize', updateScrollBehavior);

    const langSelect = document.querySelector('.lang-select');
    let currentLang = localStorage.getItem('language') || 'EN';
    const pageName = document.body.getAttribute('data-page');

    function setPageLanguage(lang, pageName) {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            el.innerHTML = window.translations[lang][pageName][key];
        });
    }
    
    window.setPageLanguage = setPageLanguage;
    langSelect.value = currentLang;
    setPageLanguage(currentLang, pageName);
    
    langSelect.addEventListener('change', function(e) {
        currentLang = this.value;
            localStorage.setItem('language', currentLang);
            setPageLanguage(currentLang, pageName);
    });
    
});

// Remove the inline onclick attribute from the HTML and handle Google Sign In
async function handleGoogleSignIn() {
    try {
        // Get auth URL from our endpoint
        const response = await fetch('/api/v1/auth/google/login');
        if (!response.ok) {
            throw new Error('Failed to start authentication process');
        }

        const data = await response.json();
        
        if (data.authorization_url) {
            window.location.href = data.authorization_url;
        } else {
            throw new Error('No authorization URL received');
        }

    } catch (error) {
        console.error('Google authentication error:', error);
    }
}

const startFreeTrialButton = document.querySelector('.start-free-trial-btn');
const contineWithGoogleButton = document.querySelector('.google-signin-button');

if (startFreeTrialButton) {
    startFreeTrialButton.addEventListener('click', handleGoogleSignIn);
}

if (contineWithGoogleButton) {
    contineWithGoogleButton.addEventListener('click', handleGoogleSignIn);
}
