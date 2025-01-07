document.addEventListener('DOMContentLoaded', function() {
    let scrollTimeout;
    let isScrolling = false;
    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    let currentSection = 0;
    let lastScrollTime = 0;
    
    function isLargeScreen() {
        return window.innerWidth >= 992;
    }

    function isTablet() {
        return window.innerWidth >= 992 && window.innerWidth <= 1200;
    }

    function updateScrollBehavior() {
        if (isTablet()) {
            // Tablet için normal scroll davranışı
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            
            // Section yüksekliklerini sıfırla
            document.querySelectorAll('.section').forEach(section => {
                section.style.height = 'auto';
                section.style.minHeight = 'auto';
            });
        } else if (isLargeScreen()) {
            // Desktop için mevcut davranış
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'visible';
        } else {
            // Mobil için davranış
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
    }

    function smoothScrollTo(element, duration = 300) {
        if (!isLargeScreen() || isTablet()) return;

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

    const langToggle = document.querySelector('.lang-toggle');
    let currentLang = 'EN';

    const translations = {
        EN: {
            login: "Log in",
            signup: "Sign Up",
            hero_title: "Find Information Fast",
            hero_description: "ragchat is your AI powered intelligent library",
            cta_get_started: "Get Started",
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
        TR: {
            login: "Giriş Yap",
            signup: "Kaydol",
            hero_title: "Bilgiye Hızlıca Ulaşın",
            hero_description: "ragchat yapay zeka destekli akıllı kütüphaneniz",
            cta_get_started: "Hemen Başlayın",
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
        }
    };

    langToggle.addEventListener('click', function(e) {
        e.preventDefault();
        currentLang = currentLang === 'EN' ? 'TR' : 'EN';
        this.textContent = currentLang;
    
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        el.innerHTML = translations[currentLang][key];
        });
    });
});