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

    // 4. EFEITO 3D TILT NOS CARDS DE SERVIÇO
    const tiltElements = document.querySelectorAll('.tilt-effect');

    tiltElements.forEach(el => {
        const height = el.clientHeight;
        const width = el.clientWidth;

        el.addEventListener('mousemove', (e) => {
            const { layerX, layerY } = e;
            const yRotation = ((layerX - width / 2) / width) * 10;
            const xRotation = ((layerY - height / 2) / height) * -10;

            const string = `
                perspective(1000px)
                scale(1.04)
                rotateX(${xRotation}deg)
                rotateY(${yRotation}deg)`;
            
            el.style.transform = string;
            el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
        });

        el.addEventListener('mouseout', () => {
            el.style.transform = 'perspective(1000px) scale(1) rotateX(0) rotateY(0)';
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

        // VALIDAÇÃO SUAVE COM FEEDBACK VISUAL
        nextBtns.forEach(button => {
            button.addEventListener('click', () => {
                const currentStepFields = steps[currentStep].querySelectorAll('[required]');
                let allValid = true;
                
                currentStepFields.forEach(field => {
                     const formGroup = field.closest('.form-group');
                    if (formGroup) formGroup.classList.remove('invalid');
                });
                
                currentStepFields.forEach(field => {
                    if (!field.checkValidity()) {
                        const formGroup = field.closest('.form-group');
                        if (formGroup) formGroup.classList.add('invalid');
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

        // Limpa a validação visual quando o usuário começa a corrigir o campo
        cotacaoForm.querySelectorAll('[required]').forEach(field => {
            field.addEventListener('input', () => {
                if(field.checkValidity()){
                    const formGroup = field.closest('.form-group');
                    if(formGroup) formGroup.classList.remove('invalid');
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

    // 7. FORMATAÇÃO AUTOMÁTICA DE CAMPOS (MÁSCARAS)
    const phoneInput = document.getElementById('remetente_telefone');
    const cepRemetenteInput = document.getElementById('remetente_cep');
    const cepDestinatarioInput = document.getElementById('destinatario_cep');

    // Função para formatar Telefone: (xx) xxxxx-xxxx
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            value = value.substring(0, 11); // Limita a 11 dígitos (DDD + 9 dígitos)

            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = '(' + value.substring(0, 2);
            }
            if (value.length > 2) {
                formattedValue += ') ' + value.substring(2, 7);
            }
            if (value.length > 7) {
                formattedValue += '-' + value.substring(7);
            }
            
            e.target.value = formattedValue;
        });
    }

    // Função reutilizável para formatar CEP: xxxxx-xxx
    const cepFormatter = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        value = value.substring(0, 8); // Limita a 8 dígitos

        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5);
        }
        
        e.target.value = value;
    };

    if (cepRemetenteInput) {
        cepRemetenteInput.addEventListener('input', cepFormatter);
    }
    if (cepDestinatarioInput) {
        cepDestinatarioInput.addEventListener('input', cepFormatter);
    }

    // 8. API DE CONSULTA DE CEP (VIACEP)
    const setupCepApi = (cepInput, ruaInput, bairroInput, cidadeInput, estadoInput, numeroInput) => {
        if (!cepInput) return; // Garante que o código não quebre se o campo não existir

        cepInput.addEventListener('blur', async (e) => { // 'blur' é acionado quando o usuário sai do campo
            const cep = e.target.value.replace(/\D/g, ''); // Limpa o CEP, deixando apenas números

            if (cep.length !== 8) {
                return; // Não faz nada se o CEP não tiver 8 dígitos
            }

            // Mostra um estado de carregamento para o usuário
            ruaInput.value = "Carregando...";
            bairroInput.value = "Carregando...";
            cidadeInput.value = "Carregando...";
            estadoInput.value = "Carregando...";

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    // Se o CEP for inválido, limpa os campos para preenchimento manual
                    alert("CEP não encontrado. Por favor, preencha o endereço manualmente.");
                    ruaInput.value = "";
                    bairroInput.value = "";
                    cidadeInput.value = "";
                    estadoInput.value = "";
                    ruaInput.focus(); // Foca na rua para preenchimento manual
                    return;
                }

                // Preenche os campos com os dados da API
                ruaInput.value = data.logradouro;
                bairroInput.value = data.bairro;
                cidadeInput.value = data.localidade;
                estadoInput.value = data.uf;

                // Força o efeito de label flutuante nos campos preenchidos
                [ruaInput, bairroInput, cidadeInput, estadoInput].forEach(input => {
                    const label = input.nextElementSibling;
                    if (label) label.classList.add('active-float'); // Adiciona uma classe para ativar
                });

                // Move o foco para o campo de número, que é o próximo passo lógico
                numeroInput.focus();
                
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                alert("Ocorreu um erro ao buscar o CEP. Tente novamente.");
                // Limpa os campos em caso de erro de rede
                ruaInput.value = "";
                bairroInput.value = "";
                cidadeInput.value = "";
                estadoInput.value = "";
            }
        });
    };

    // Configura a API para o formulário do REMETENTE
    setupCepApi(
        document.getElementById('remetente_cep'),
        document.getElementById('remetente_rua'),
        document.getElementById('remetente_bairro'),
        document.getElementById('remetente_cidade'),
        document.getElementById('remetente_estado'),
        document.getElementById('remetente_numero')
    );

    // Configura a API para o formulário do DESTINATÁRIO
    setupCepApi(
        document.getElementById('destinatario_cep'),
        document.getElementById('destinatario_rua'),
        document.getElementById('destinatario_bairro'),
        document.getElementById('destinatario_cidade'),
        document.getElementById('destinatario_estado'),
        document.getElementById('destinatario_numero')
    );
});