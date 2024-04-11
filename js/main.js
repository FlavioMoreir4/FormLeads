// Classe para utilidades
class Utils {
    // Retorna o valor do parâmetro especificado na URL
    static getParams(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param) || false;
    }

    // Converte a primeira letra de cada palavra em maiúscula e o restante em minúscula
    static capitalizeFirstLetter(str) {
        return str
            .toLowerCase()
            .split(" ")
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    }

    // Retorna os parâmetros da URL como objeto
    static getSearchParameters() {
        const prmstr = window.location.search.substr(1);
        return prmstr ? this.transformToAssocArray(prmstr) : {};
    }

    // Transforma uma string de parâmetros em um objeto associativo
    static transformToAssocArray(prmstr) {
        const params = {};
        const prmarr = prmstr.split("&");
        for (let i = 0; i < prmarr.length; i++) {
            const tmparr = prmarr[i].split("=");
            params[tmparr[0]] = decodeURIComponent(tmparr[1]);
        }
        return params;
    }

    // Retorna os cookies da página como objeto
    static getSearchCookies() {
        const prmstr = document.cookie;
        return prmstr ? this.transformCookiesToAssocArray(prmstr) : {};
    }

    // Transforma uma string de cookies em um objeto associativo
    static transformCookiesToAssocArray(prmstr) {
        const params = {};
        const prmarr = prmstr.split(";");
        for (let i = 0; i < prmarr.length; i++) {
            const tmparr = prmarr[i].split("=");
            params[tmparr[0].trim()] = decodeURI(tmparr[1]);
        }
        return params;
    }

    // Retorna um array com as chaves e valores do objeto passado
    static newObj(array, values = false) {
        if (!values) {
            return Object.entries(array);
        } else {
            return Object.values(array);
        }
    }

    // Retorna um ID único
    static uniqueId(length = 16) {
        return parseInt(
            Math.ceil(Math.random() * Date.now())
                .toPrecision(length)
                .toString()
                .replace(".", "")
        );
    }

    // Função para verificar se uma string contém outra
    static strpos(haystack, needle, offset) {
        const i = (haystack + "").indexOf(needle, offset || 0);
        return i === -1 ? false : true;
    }

    // Função para formatar input de telefone com máscara
    static inputHandler(masks, max, event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, "");
        const maskIndex = input.value.length > max ? 1 : 0;
        VMasker(input).unMask();
        VMasker(input).maskPattern(masks[maskIndex]);
        input.value = VMasker.toPattern(value, masks[maskIndex]);
    }
}

// Classe para requisições de rede
class Network {
    /**
     * Consulta a URL informada com o método POST, enviando os dados da requisição como parâmetro.
     *
     * @param {string} URL - A URL que será consultada.
     * @param {{Object}} headers - Um objeto contendo os cabeçalhos da requisição.
     * @param {Object} param - Um objeto contendo os parâmetros da requisição.
     * @param {Object} method - O método HTTP da requisição.
     * @returns {Promise} - Uma promessa com o resultado da consulta.
     */
    static async Consult({ URL, headers = {}, params = {}, method = 'GET', }) {
        try {

            let url = URL
            let body = null
            if (method.toUpperCase() === 'GET' && params && Object.keys(params).length > 0) {
                const queryParams = Object.keys(params)
                    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
                    .join('&');
                url += '?' + queryParams;
            }

            if (method.toUpperCase() === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(params);
            }

            const response = await fetch(url, {
                method,
                headers,
                body: body
            });

            return response.json(); // Converte a resposta para JSON
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Insere dados na URL informada com o método POST.
     *
     * @param {string} URL - A URL que receberá os dados.
     * @param {FormData} Data - Um objeto FormData contendo os dados a serem inseridos.
     * @returns {Promise} - Uma promessa com o resultado da inserção.
     */
    static async Insert(URL, Data, Headers = {}) {
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    ...Headers
                },
                body: new URLSearchParams(Data),
            });
            return response.json(); // Normalmente você quer transformar a resposta em JSON
        } catch (error) {
            console.error(error);
        }
    }

    static async fetchAdditionalInfo(
        form,
        url = "https://www.cloudflare.com/cdn-cgi/trace"
    ) {
        try {
            const response = await fetch(url);
            let data = await response.text();

            // Converte o resultado para um objeto
            data = data
                .trim()
                .split("\n")
                .reduce((obj, pair) => {
                    const [key, value] = pair.split("=");
                    obj[key] = value;
                    return obj;
                }, {});

            // Adiciona as informações do objeto às propriedades do formulário
            Object.entries(data).forEach(([key, val]) => {
                // Remove hífens e sublinhados do nome da propriedade
                const formattedKey = key.replaceAll(/-|_/g, "");
                if (form[formattedKey]) {
                    form[formattedKey].value = val;
                } else {
                    const input = document.createElement("input");
                    input.name = formattedKey;
                    input.value = val;
                    input.type = "hidden";
                    form.appendChild(input);
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }
}

class CookieAndURLManager {
    static fillFormFromURLParameters(form) {
        // Pegar os parâmetros da URL como um objeto
        const urlParams = Utils.getSearchParameters();

        // Iterar sobre cada parâmetro e preencher o formulário correspondente
        for (const [key, value] of Object.entries(urlParams)) {
            // Converta hífens e sublinhados para uma string camelCase, se necessário
            const formattedKey = key.replaceAll(/-|_/g, "");

            // Verificar se o formulário tem um campo com o nome correspondente
            if (form[formattedKey]) {
                form[formattedKey].value = value;
            } else {
                // Se o formulário não tem um campo com esse nome, criar um input escondido
                const input = document.createElement("input");
                input.name = formattedKey;
                input.value = value;
                input.type = "hidden";
                form.appendChild(input);
            }
        }
    }

    static fillFormFromCookies(form) {
        // Obtém os cookies como um objeto
        const cookies = Utils.getSearchCookies();

        // Itera sobre cada cookie e preenche o formulário correspondente
        for (const [key, value] of Object.entries(cookies)) {
            // Converte hífens e sublinhados para uma string camelCase, se necessário
            const formattedKey = key.replaceAll(/-|_/g, "");

            // Verifica se o formulário tem um campo com o nome correspondente
            if (form[formattedKey]) {
                form[formattedKey].value = value;
            } else {
                // Se o formulário não tem um campo com esse nome, criar um input escondido
                const input = document.createElement("input");
                input.name = formattedKey;
                input.value = value;
                input.type = "hidden";
                form.appendChild(input);
            }
        }
    }
}

class EventTracker {
    // Método para enviar eventos ao Google Tag Manager
    static sendGTMEvent(event, data = {}) {
        if (window.dataLayer) {
            window.dataLayer.push({
                event,
                ...data,
            });
        } else {
            console.warn("Google Tag Manager não está inicializado");
        }
    }

    // Método para enviar eventos padrão ao Facebook Ads
    static sendFBStandardEvent(event, data = {}, options = {}) {
        if (typeof fbq !== "undefined") {
            fbq("track", event, data, options);
        } else {
            console.warn("Facebook Pixel não está inicializado");
        }
    }

    // Método para enviar eventos customizados ao Facebook Ads
    static sendFBCustomEvent(event, data = {}, options = {}) {
        if (typeof fbq !== "undefined") {
            fbq("trackCustom", event, data, options);
        } else {
            console.warn("Facebook Pixel não está inicializado");
        }
    }

    // Método para enviar eventos padrão ou customizados, baseado na plataforma
    static sendEvent({ platform, eventType, eventData = {}, eventOptions = {}, trackingType = "standard" }) {
        switch (platform) {
            case "GTM":
                this.sendGTMEvent(eventType, eventData);
                break;
            case "FB":
                if (trackingType === "standard") {
                    this.sendFBStandardEvent(eventType, eventData, eventOptions);
                } else if (trackingType === "custom") {
                    this.sendFBCustomEvent(eventType, eventData, eventOptions);
                }
                break;
            default:
                console.warn("Plataforma de rastreamento não suportada");
        }
    }
}

class GoogleSheetManager {
    static async sendToSheet(data) {
        const url =
            "https://script.google.com/macros/s/AKfycbzM67Bk0kY1D3m5SN4C-SgolF-R4syJOP3ubsUT91Ye5HseIF1akU0ply7TdhxZHQxzjA/exec";
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(data).toString(),
        };

        try {
            const response = await fetch(url, params);
            const result = await response.text();
            if (result === "Dados inseridos com sucesso!") {
                console.info("Dados enviados para o Google Sheet com sucesso.");
            } else {
                console.error("Falha ao enviar dados para o Google Sheet.");
            }
        } catch (error) {
            console.error("Erro ao enviar para o Google Sheet: ", error);
        }
    }
}

// Classe FormLead para lidar especificamente com lógica de formulário
class FormLead {
    constructor(formElement, apiConfig) {
        this.form = formElement;
        this.apiConfig = apiConfig;
        this.idadeElement = this.form.querySelector("#idade");
        this.cursoElement = this.form.querySelector("#curso");
        this.regiaoElement = this.form.querySelector("#regiao");
        this.nomeRegiaoElement = this.form.querySelector("#nome_regiao");
        this.alertUnidadeElement =
            this.form.querySelector("#alert_unidade");
        this.cursoNomeElement = this.form.querySelector("#franquia");
        this.idEventElement = this.form.querySelector("#id_event");
        this.horarioElement = this.form.querySelector("#horario");
        this.confirmedLeadElement = document.querySelector("#confirm_lead");
        this.idadesByCurso = {
            1: [6, 7, 8, 9, 10, 11, 12],
            16: [13, 14, 15, 16, 17],
        };
        this.horarios = {
            "Manhã": ["09:00", "11:00"],
            "Tarde": ["13:00", "15:00"]
        };
        this.patternsMask = {
            whats: ["99 9999-9999", "99 99999-9999"],
        };
        this.r = Utils.getParams("r");
        this.PopUp = Swal.mixin({
            confirmButtonColor: "#075E54",
        });
        this.initialize();
    }

    // Método para inicializar os elementos do formulário e configurações.
    initialize() {

        // Preenche o formulário com os parâmetros da URL e cookies do navegador e busca informações adicionais 
        CookieAndURLManager.fillFormFromURLParameters(this.form);
        CookieAndURLManager.fillFormFromCookies(this.form);
        Network.fetchAdditionalInfo(this.form);

        // Adiciona campos ocultos para o site e o site_referrer
        this.addHiddenField("site", window.location.href);
        this.addHiddenField("site_referrer", document.referrer);

        // Adiciona campos ocultos para o ID do evento e os parâmetros UTM
        this.addHiddenField("id_event", Utils.uniqueId());
        this.addHiddenField(
            "utm_source",
            Utils.getParams("utm_source") || "Orgânico"
        );
        this.addHiddenField(
            "utm_medium",
            Utils.getParams("utm_medium") || "Orgânico"
        );
        this.addHiddenField(
            "utm_campaign",
            Utils.getParams("utm_campaign") || "Orgânico"
        );


        this.applyWhatsAppMask();
        this.setupSubmitListener();
        this.setupAlertUnidadeListener();
        // Preenche as opções de idade com base no mapeamento de idades por curso
        this.populateIdadeOptions();
        this.setupIdadeChangeListener();
    }

    // Método para adicionar ou atualizar um campo de entrada oculto ao formulário
    addHiddenField(name, value) {
        let existingInput = this.form.querySelector(
            `input[name="${name}"]`
        );
        if (existingInput) {
            existingInput.value = value;
        } else {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            this.form.appendChild(input);
        }
    }

    validateForm() {
        // Adicione aqui sua lógica de validação

    }

    // Método para aplicar máscara no campo de WhatsApp
    applyWhatsAppMask() {
        const inputs = document.querySelectorAll('input[type="tel"]');
        inputs.forEach((input) => {
            // Utilizando Utils para funções utilitárias
            input.addEventListener(
                "input",
                Utils.inputHandler.bind(null, this.patternsMask.whats, 12),
                false
            );
        });
    }

    // Método para popular as opções de idade com base no mapeamento de idades por curso
    populateIdadeOptions() {
        const uniqueIdades = new Set();
        for (let key in this.idadesByCurso) {
            this.idadesByCurso[key].forEach((idade) =>
                uniqueIdades.add(idade)
            );
        }

        Array.from(uniqueIdades)
            .sort((a, b) => a - b)
            .forEach((idade) => {
                const option = document.createElement("option");
                option.value = idade;
                option.text = idade;
                this.idadeElement.append(option);
            });
    }

    /**
     * Método para exibir mensagens de erro
     * @param {String} errorMsg
     */
    displayMsg(type, title, msg = "", additional = {}) {
        this.PopUp.fire({
            icon: type,
            title: title,
            text: msg,
            showConfirmButton: true,
            ...additional,
        });
    }

    /**
     * Método para criar uma opção de seleção
     * @param {Object} val
     */
    createOption(val) {
        const option = document.createElement("option");
        option.text = val.nome;
        option.value = val.id;
        Utils.newObj(val).forEach(([key, value]) => {
            option.setAttribute(`data-${key}`, value);
        });
        return option;
    }

    processarHorariosPadroes() {
        // Verifica se this.regiaoElement.selectedOptions[0] existe
        const selectUnit = this.regiaoElement.selectedOptions[0];
        const defaultHorarios = selectUnit && selectUnit.dataset.horarios ? false : true;
        this.horarioElement.innerHTML = ""; // Limpa as opções anteriores
        // Adiciona uma opção desabilitada como placeholder
        const disabledOption = document.createElement("option");
        disabledOption.textContent = "Selecione um horário";
        disabledOption.disabled = true;
        disabledOption.selected = true;
        this.horarioElement.appendChild(disabledOption);

        if (defaultHorarios) {
            // Adiciona as opções de horário baseadas nos horários padrões
            Object.entries(this.horarios).forEach(([categoria, horarios]) => {
                const optgroup = document.createElement("optgroup");
                optgroup.label = categoria;
                horarios.forEach(hora => {
                    const option = document.createElement("option");
                    option.value = hora;
                    option.textContent = hora;
                    optgroup.appendChild(option);
                });
                this.horarioElement.appendChild(optgroup);
            });
        } else {
            // Adiciona as opções de horário baseadas nos horários disponíveis
            const horarios = JSON.parse(this.regiaoElement.selectedOptions[0].dataset.horarios);
            let horariosObj = {};
            //Definir se é manhã ou tarde
            let Manha = horarios.filter(horario => parseInt(horario.split(":")[0]) < 12);
            let Tarde = horarios.filter(horario => parseInt(horario.split(":")[0]) >= 12);

            if (Manha.length > 0) {
                horariosObj["Manhã"] = Manha;
            }
            if (Tarde.length > 0) {
                horariosObj["Tarde"] = Tarde;
            }

            Object.entries(horariosObj).forEach(([categoria, horarios]) => {
                const optgroup = document.createElement("optgroup");
                optgroup.label = categoria;
                horarios.forEach(hora => {
                    const option = document.createElement("option");
                    option.value = hora;
                    option.textContent = hora;
                    optgroup.appendChild(option);
                });
                this.horarioElement.appendChild(optgroup);
            });
        }
    }

    atualizarHorarios() {
        // Aqui você pode adicionar lógica para atualizar horários baseados na unidade selecionada
        // Por exemplo, buscar horários específicos da unidade ou usar os horários padrões
        // Este exemplo apenas processa horários padrões, que você pode ajustar conforme necessário
        this.processarHorariosPadroes();

        if (
            this.horarioElement.parentElement.classList.contains("mkt-hide")
            && (this.regiaoElement.value !== "" && this.regiaoElement.value !== "Selecione uma região")
        ) {
            // Mostrar o elemento de horários
            this.horarioElement.parentElement.classList.remove("mkt-hide");
        }
    }

    /**
     * Método assíncrono para pegar unidades de um curso.
     * @param {boolean} sigla - Se deve pegar todas as unidades ou não
     */
    async getUnidades(sigla = false) {
        try {
            // Validação do formulário
            this.validateForm();
            const produtoSelecionado = this.cursoElement.value;
            const response = await Network.Consult({
                URL: this.apiConfig.baseURL + this.apiConfig.endpoints.unidades,
                headers: {
                    Authorization: this.apiConfig.authorizationToken,
                },
                params: {
                    produto: produtoSelecionado,
                    sigla: sigla ? this.r : '',
                },
            });

            // Limpa as opções anteriores do select de regiões
            this.regiaoElement.innerHTML = "";

            // Cria e adiciona uma opção desabilitada como placeholder
            const disabledOption = document.createElement("option");
            disabledOption.textContent = "Selecione uma região";
            disabledOption.disabled = true;
            disabledOption.selected = true;
            this.regiaoElement.appendChild(disabledOption);

            // Adiciona as unidades como opções ao select de regiões
            response.forEach(unidade => {
                const produtoAtivo = unidade.produtos_ativos.find(produto => produto.id.toString() === produtoSelecionado);

                if (produtoAtivo) {
                    const option = document.createElement("option");
                    const horarios = unidade.schedules.filter(schedule => schedule.produto_id.toString() === produtoSelecionado).map(schedule => schedule.hora.substring(0, 5)); // Extrai apenas a hora, sem segundos
                    option.value = unidade.id;
                    option.textContent = unidade.nome;
                    option.dataset.divulgadorUnidade = unidade.divulgador;
                    option.dataset.divulgadorIdUnidade = unidade.divulgador_id;
                    option.dataset.whatsappDivulgadorUnidade = unidade.whatsapp_divulgador;
                    // Adiciona detalhes do produto ativo ao dataset da opção
                    option.dataset.divulgador = produtoAtivo.divulgador;
                    option.dataset.whatsappDivulgador = produtoAtivo.whatsapp_divulgador;
                    option.dataset.telemarketing = produtoAtivo.telemarketing;
                    option.dataset.telemarketingWhatsapp = produtoAtivo.telemarketing_whatsapp;
                    if (horarios.length > 0) {
                        // Armazena os horários no dataset da opção para posterior uso
                        option.dataset.horarios = JSON.stringify(horarios);
                    }
                    this.regiaoElement.appendChild(option);
                }
            });

            // Processamento de horários padrões caso a unidade não retorne schedules
            this.processarHorariosPadroes();

            // Evento de mudança para regiões
            this.regiaoElement.addEventListener('change', this.atualizarHorarios.bind(this));

            // Se houver apenas uma unidade, define-a como selecionada e esconde o select
            if (response.length === 1) {
                this.regiaoElement.selectedIndex = 1; // Seleciona automaticamente a única opção disponível
                this.regiaoElement.parentElement.classList.add("mkt-hide");
                this.alertUnidadeElement.classList.remove("mkt-hide");
            } else {
                this.regiaoElement.parentElement.classList.remove("mkt-hide");
                this.alertUnidadeElement.classList.add("mkt-hide");
            }

            // Atualiza o nome da região selecionada
            document.querySelectorAll(".nome_regiao").forEach((e) => {
                e.textContent = this.regiaoElement.selectedOptions[0].textContent; // Mudança de dataset.nome para textContent
            });

            // Evento de mudança para atualizar o nome da região
            this.regiaoElement.dispatchEvent(new Event("change"));
            this.nomeRegiaoElement.value = Utils.capitalizeFirstLetter(this.regiaoElement.selectedOptions[0].textContent); // Mudança de dataset.nome para textContent

        } catch (error) {
            console.error(error);
            this.displayMsg(
                "error",
                "Ocorreu um erro ao buscar as unidades",
                "Tente novamente mais tarde."
            );
        }
    }

    limparRegiao() {
        this.r = false; // Limpa a sigla da região
        this.getUnidades(); // Repopula com todas as unidades disponíveis
    }

    /**
     * Método para adicionar um listener de mudança de idade
     */
    setupIdadeChangeListener() {
        this.idadeElement.addEventListener("change", (event) => {
            const selectedIdade = parseInt(event.target.value);
            for (let key in this.idadesByCurso) {
                if (this.idadesByCurso[key].includes(selectedIdade)) {
                    this.cursoElement.value = key;
                    this.getUnidades(this.r);
                    break;
                }
            }
        });
    }

    setupAlertUnidadeListener() {
        this.alertUnidadeElement.querySelector(".mkt-cursor").addEventListener("click", (event) => {
            event.preventDefault();
            this.limparRegiao();
        });
        this.regiaoElement.addEventListener("change", (event) => {
            document.querySelectorAll(".nome_regiao").forEach((e) => {
                e.textContent = this.regiaoElement.selectedOptions[0].textContent;
            });
            this.nomeRegiaoElement.value = Utils.capitalizeFirstLetter(
                this.regiaoElement.selectedOptions[0].textContent
            );
        }, false);
        this.atualizarHorarios();
    }

    setupSubmitListener() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();

            // Mostra o pop-up antes do envio
            this.preSubmitPopup();

            // Executa a função de envio do formulário
            this.submitForm();
        });
    }

    preSubmitPopup() {
        this.PopUp.fire({
            title: `Procurando Instrutor em ${this.nomeRegiaoElement.value}`,
            icon: "success",
            html: `<h3>Você será direcionado para WhatsApp, aguarde!</h3>`,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,

            didOpen: () => {
                this.PopUp.showLoading();
            },
        });
    }

    async submitForm() {
        try {
            const data = await Network.Insert(
                this.apiConfig.baseURL + this.apiConfig.endpoints.leadsAdd,
                new FormData(this.form),
                {
                    Authorization: this.apiConfig.authorizationToken,
                }
            );

            if (data.duplicado) {
                // Envia evento ao Google Tag Manager
                EventTracker.sendEvent({
                    platform: "GTM",
                    eventType: "Lead Duplicado",
                    eventData: {},
                });

                // Envia eventos customizados ao Facebook Ads
                EventTracker.sendEvent({
                    platform: "FB",
                    eventType: `Lead Duplicado ${this.cursoNomeElement.value}`,
                    eventData: { eventID: this.idEventElement.value },
                    trackingType: "custom",
                });
                EventTracker.sendEvent({
                    platform: "FB",
                    eventType: `Lead Duplicado ${this.cursoNomeElement.value} ${this.nomeRegiaoElement.value}`,
                    eventData: { eventID: `C_${this.idEventElement.value}` },
                    trackingType: "custom",
                });
            } else {
                // Envia evento ao Google Tag Manager
                EventTracker.sendEvent({
                    platform: "GTM",
                    eventType: "Lead",
                    eventData: {},
                });

                // Envia eventos padrão ao Facebook Ads
                EventTracker.sendEvent({
                    platform: "FB",
                    eventType: "Lead",
                    eventData: { eventID: this.idEventElement.value },
                });

                // Envia evento customizado ao Facebook Ads
                EventTracker.sendEvent({
                    platform: "FB",
                    eventType: `Lead ${this.cursoNomeElement.value} ${this.nomeRegiaoElement.value}`,
                    eventData: { eventID: `C_${this.idEventElement.value}` },
                    trackingType: "custom",
                });
            }

            // Preparar o data.lead para o envio
            data.lead.horario = this.horarioElement.value;
            // Envia dados para o Google Sheet
            await GoogleSheetManager.sendToSheet(data.lead);
            this.postSubmitAction(data);
        } catch (error) {
            console.error(error);
        }
    }

    postSubmitAction(data) {

        this.form.classList.add("mkt-hide");
        this.confirmedLeadElement.classList.remove("mkt-hide");

        let count = 0;

        const tel = data.irc_response.whatsapp_divulgador ? data.irc_response.whatsapp_divulgador.replace(/[- ()]/g, "") : this.regiaoElement.selectedOptions[0].dataset.whatsappDivulgadorUnidade.replace(/[- ()]/g, "");

        const msgHeader = `*EU QUERO*\n`;
        const msgId = data.lead.id_lead
            ? `Meu número da inscrição é *${data.lead.id_lead}*\n`
            : "";
        const msgName = data.lead.candidato
            ? `Nome do candidato é *${data.lead.candidato}*\n`
            : "";
        const msgResp = data.lead.responsavel
            ? `Responsável é *${data.lead.responsavel}*\n`
            : "";
        const msgRegion = `Região: *${this.nomeRegiaoElement.value}*`;

        const msg = `${msgHeader}${msgId}${msgName}${msgResp}${msgRegion}`;
        const link = `https://wa.me/55${encodeURIComponent(
            tel
        )}?text=${encodeURIComponent(msg)}`;

        const a = document.createElement("a");

        const duration = 100; // tempo em milissegundos

        const intervalId = setInterval(() => {
            if (count >= 50) {
                clearInterval(intervalId);

                a.href = link;
                a.target = "_blank";
                document
                    .querySelector("#btn_link_wpp")
                    .setAttribute("href", link);
                a.click();

                this.PopUp.fire({
                    title: "Tudo pronto",
                    icon: "success",
                    text: `Clique no botão abaixo para falar com responsável em ${this.nomeRegiaoElement.value}`,
                    confirmButtonText: `<i class="fab fa-whatsapp"></i> Abrir WhatsApp`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        a.click();
                    }
                });
            } else {
                count++;
            }
        }, duration);
    }
}

const apiConfig = {
    baseURL: "http://127.0.0.1:8000/api/",
    authorizationToken: "Bearer 2|Qxf1OOZMpmRERgVzS6rVPhx0ThRa4ucP04YflBRr7f37ed5e",
    endpoints: {
        leadsAdd: "leads/add",
        unidades: "unidades",
    },
};

//Instanciar FormLead
const formLead = new FormLead(document.querySelector("#formLead"), apiConfig);