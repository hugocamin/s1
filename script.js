document.addEventListener('DOMContentLoaded', function() {

    // 1. HEADER DINÂMICO AO ROLAR A PÁGINA
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. MENU HAMBÚRGUER E OVERLAY MOBILE (FUNCIONAL)
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileNav && closeMenuBtn) {
        const openMenu = () => {
            mobileNav.classList.add('active');
            document.body.classList.add('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'false');
        };

        menuToggle.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // 3. ANIMAÇÃO DE ELEMENTOS AO APARECEREM NA TELA (Scroll)
    const scrollElements = document.querySelectorAll('.animate-on-scroll');

    const elementObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    scrollElements.forEach(el => {
        elementObserver.observe(el);
    });

    // 4. EFEITO 3D TILT NOS CARDS DE SERVIÇO (SOMBRA CORRIGIDA)
    const tiltElements = document.querySelectorAll('.tilt-effect');

    tiltElements.forEach(el => {
        const height = el.clientHeight;
        const width = el.clientWidth;

        el.addEventListener('mousemove', (e) => {
            const { layerX, layerY } = e;
            const yRotation = ((layerX - width / 2) / width) * 10; // Reduzido
            const xRotation = ((layerY - height / 2) / height) * -10; // Reduzido

            const string = `
                perspective(1000px)
                scale(1.04)
                rotateX(${xRotation}deg)
                rotateY(${yRotation}deg)`;
            
            el.style.transform = string;
            // << CORREÇÃO: Sombra mais sutil para fundo claro
            el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
        });

        el.addEventListener('mouseout', () => {
            el.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
            // << CORREÇÃO: Reset da sombra
            el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.04)';
        });
    });

    // --- LÓGICA GERAL PARA FORMULÁRIOS COM AJAX (Formspree) ---
    function handleFormSubmit(form, statusElement) {
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);
            const originalButtonText = submitButton.innerHTML;
            
            submitButton.disabled = true;
            submitButton.innerHTML = `<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>`;

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;

                if (response.ok) {
                    form.reset();
                    if(statusElement) {
                        statusElement.innerHTML = "Mensagem enviada com sucesso!";
                        statusElement.style.color = "#28a745";
                        statusElement.style.display = 'block';
                    }
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                if(statusElement) {
                    statusElement.innerHTML = "Ocorreu um erro. Tente novamente.";
                    statusElement.style.color = "#dc3545";
                    statusElement.style.display = 'block';
                }
            });
        });
    }

    // 5. FORMULÁRIO DE CONTATO SIMPLES
    handleFormSubmit(
        document.getElementById('contactForm'), 
        document.getElementById('contact-form-status')
    );

    // 6. LÓGICA DO FORMULÁRIO DE COTAÇÃO MULTI-PASSOS
    const cotacaoForm = document.getElementById('cotacaoForm');
    if (cotacaoForm) {
        const steps = Array.from(cotacaoForm.querySelectorAll('.form-step'));
        const nextBtns = cotacaoForm.querySelectorAll('.btn-next');
        const prevBtns = cotacaoForm.querySelectorAll('.btn-prev');
        const progressBar = document.querySelector('#cotacao .progress-bar');
        const statusMessage = document.getElementById('cotacao-form-status');

        let currentStep = 0;

        const updateFormSteps = () => {
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });
        };

        const updateProgressBar = () => {
            const progressBarSteps = progressBar.querySelectorAll('.progress-step');
            progressBarSteps.forEach((stepEl, index) => {
                if (index <= currentStep) {
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active');
                }
            });
            const progressPercentage = (currentStep / (steps.length - 1)) * 100;
            progressBar.style.setProperty('--progress-width', `${progressPercentage}%`);
        };

        nextBtns.forEach(button => {
            button.addEventListener('click', () => {
                const currentStepFields = steps[currentStep].querySelectorAll('input[required]');
                let allValid = true;
                currentStepFields.forEach(field => {
                    if (!field.checkValidity()) {
                        field.reportValidity();
                        allValid = false;
                    }
                });

                if (allValid && currentStep < steps.length - 1) {
                    currentStep++;
                    updateFormSteps();
                    updateProgressBar();
                }
            });
        });

        prevBtns.forEach(button => {
            button.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    updateFormSteps();
                    updateProgressBar();
                }
            });
        });

        cotacaoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = cotacaoForm.querySelector('button[type="submit"]');
            const formData = new FormData(cotacaoForm);
            
            submitButton.disabled = true;
            submitButton.innerHTML = `<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>`;

            fetch(cotacaoForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    progressBar.style.display = 'none';
                    cotacaoForm.style.display = 'none';
                    statusMessage.innerHTML = "<h3>Enviado com sucesso!</h3><p>Em breve você receberá uma resposta em seu e-mail.</p>";
                    statusMessage.className = 'form-status-message success';
                    statusMessage.style.display = 'block';
                } else {
                    throw new Error('Houve um problema com o envio.');
                }
            })
            .catch(error => {
                statusMessage.innerHTML = "<h3>Ocorreu um erro.</h3><p>Por favor, tente novamente mais tarde ou entre em contato por outro canal.</p>";
                statusMessage.className = 'form-status-message error';
                statusMessage.style.display = 'block';
                
                submitButton.disabled = false;
                submitButton.innerHTML = `<span>Solicitar Cotação</span> <i class="fas fa-paper-plane"></i>`;
            });
        });

        updateFormSteps();
        updateProgressBar();
    }
});