/**
 * Classe UIController.
 * Responsável por todas as interações com o DOM.
 */
export class UIController {
    constructor(productManager) {
        this.productManager = productManager;
        this.elements = {
            messageBox: document.getElementById('messageBox'),
            tabButtons: document.querySelectorAll('.tab-button'),
            formSections: document.querySelectorAll('.form-section'),
            productList: document.getElementById('productList'),
            searchBar: document.getElementById('searchBar'),
            searchByRadios: document.querySelectorAll('input[type="radio"][name="searchBy"]'),
            productId: document.getElementById('productId'),
            productName: document.getElementById('productName'),
            productCategory: document.getElementById('productCategory'),
            productBrand: document.getElementById('productBrand'),
            productDetails: document.getElementById('productDetails'),
            productMeasure: document.getElementById('productMeasure'),
            productPrice: document.getElementById('productPrice'),
            saveProductBtn: document.getElementById('saveProductBtn'),
            clearFormBtn: document.getElementById('clearFormBtn'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            copyDataBtn: document.getElementById('copyDataBtn'),
            importFile: document.getElementById('importFile'),
            importDataBtn: document.getElementById('importDataBtn'),
            loadDemoDataBtn: document.getElementById('loadDemoDataBtn'),
            clearAllDataBtn: document.getElementById('clearAllDataBtn'),
            scrollToTopBtn: document.getElementById('scrollToTopBtn')
        };
        this.initEventListeners();
        this.showSection('consultation'); // Inicia na seção de consulta
        this.renderProductList(); // Renderiza a lista inicial
    }

    /**
     * Inicializa todos os event listeners da UI.
     */
    initEventListeners() {
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.showSection(e.target.dataset.section));
        });

        this.elements.searchBar.addEventListener('input', () => this.handleSearch());
        this.elements.searchByRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleSearch());
        });

        this.elements.saveProductBtn.addEventListener('click', () => this.handleSaveProduct());
        this.elements.clearFormBtn.addEventListener('click', () => this.clearForm());

        this.elements.exportDataBtn.addEventListener('click', () => this.handleExportData());
        this.elements.copyDataBtn.addEventListener('click', () => this.handleCopyData());
        this.elements.importDataBtn.addEventListener('click', () => this.handleImportData());
        this.elements.loadDemoDataBtn.addEventListener('click', () => this.handleLoadDemoData());
        this.elements.clearAllDataBtn.addEventListener('click', () => this.confirmClearData());

        this.elements.scrollToTopBtn.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', () => this.toggleScrollToTopButton());

        // Delegação de eventos para botões de editar/excluir nos cards de produto
        this.elements.productList.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('secondary') && target.textContent === 'Editar') {
                const productId = target.closest('.product-card').dataset.productId;
                this.editProduct(productId);
            } else if (target.classList.contains('danger') && target.textContent === 'Excluir') {
                const productId = target.closest('.product-card').dataset.productId;
                this.confirmDeleteProduct(productId);
            } else if (target.closest('.product-card-header')) {
                const productId = target.closest('.product-card').dataset.productId;
                this.toggleProductCard(productId);
            }
        });
    }

    /**
     * Exibe uma mensagem na caixa de mensagens.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - Tipo da mensagem ('success' ou 'error').
     */
    showMessage(message, type = 'success') {
        const messageBox = this.elements.messageBox;
        messageBox.textContent = message;
        messageBox.className = `message-box show ${type}`;
        setTimeout(() => {
            messageBox.className = `message-box ${type}`;
            setTimeout(() => window.location.reload(), 600) // Recarrega para limpar o estado visual
        }, 3000);
    }

    /**
     * Alterna a visibilidade dos detalhes do card do produto.
     * @param {string} productId - ID do produto.
     */
    toggleProductCard(productId) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (card) {
            card.classList.toggle('expanded');
        }
    }

    /**
     * Renderiza a lista de produtos no DOM.
     * @param {Array<Product>} productsToDisplay - Lista de produtos a serem exibidos.
     */
    renderProductList(productsToDisplay = this.productManager.products) {
        const productList = this.elements.productList;
        productList.innerHTML = '';

        if (productsToDisplay.length === 0) {
            productList.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m-1 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                    </svg>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros de busca ou adicione novos produtos.</p>
                </div>
            `;
            return;
        }

        // Ordena os produtos por nome
        productsToDisplay.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product.id);

            productCard.innerHTML = `
                <div class="product-card-header">
                    <h3 class="product-name">${product.name || 'N/A'}</h3>
                    <div class="product-price">${product.price !== null && product.price !== undefined ? `R$ ${product.price.toFixed(2)}` : 'N/A'}</div>
                    <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <div class="product-date-status ${product.getDateStatus()}"></div>
                </div>
                <div class="product-details">
                    <div class="product-details-content">
                        <div class="detail-row">
                            <span class="detail-label">Categoria:</span>
                            <span class="detail-value">${product.category || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Marca:</span>
                            <span class="detail-value">${product.brand || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Detalhes:</span>
                            <span class="detail-value">${product.details || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Medida:</span>
                            <span class="detail-value">${product.measure || 'N/A'}</span>
                        </div>
                        <div class="product-actions">
                            <button class="secondary">Editar</button>
                            <button class="danger">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    /**
     * Obtém o valor do radio button de busca selecionado.
     * @returns {string} O valor do critério de busca.
     */
    getSearchByValue() {
        for (const radioButton of this.elements.searchByRadios) {
            if (radioButton.checked) {
                return radioButton.value;
            }
        }
        return 'name'; // Padrão
    }

    /**
     * Manipula a busca de produtos.
     */
    handleSearch() {
        const searchTerm = this.elements.searchBar.value.toLowerCase();
        const searchBy = this.getSearchByValue();
        const filteredProducts = this.productManager.searchProducts(searchTerm, searchBy);
        this.renderProductList(filteredProducts);
    }

    /**
     * Manipula o salvamento de um produto.
     */
    handleSaveProduct() {
        const id = this.elements.productId.value;
        const name = this.elements.productName.value.trim();
        const category = this.elements.productCategory.value.trim();
        const brand = this.elements.productBrand.value.trim();
        const details = this.elements.productDetails.value.trim();
        const measure = this.elements.productMeasure.value.trim();
        const price = parseFloat(this.elements.productPrice.value);

        if (!name) {
            this.showMessage('O nome do produto é obrigatório!', 'error');
            return;
        }
        if (isNaN(price)) {
            this.showMessage('O preço deve ser um número válido!', 'error');
            return;
        }

        const productData = {
            id,
            name,
            category: category || null,
            brand: brand || null,
            details: details || null,
            measure: measure || null,
            price: price
        };

        this.productManager.saveProduct(productData);
        this.showMessage(id ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
        this.clearForm();
        this.showSection('consultation');
    }

    /**
     * Preenche o formulário com os dados de um produto para edição.
     * @param {string} id - ID do produto a ser editado.
     */
    editProduct(id) {
        const product = this.productManager.getProductById(id);
        if (product) {
            this.elements.productId.value = product.id;
            this.elements.productName.value = product.name;
            this.elements.productCategory.value = product.category || '';
            this.elements.productBrand.value = product.brand || '';
            this.elements.productDetails.value = product.details || '';
            this.elements.productMeasure.value = product.measure || '';
            this.elements.productPrice.value = product.price;
            this.showSection('registration');
        }
    }

    /**
     * Exibe um modal de confirmação para exclusão de produto.
     * @param {string} id - ID do produto a ser excluído.
     */
    confirmDeleteProduct(id) {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
        confirmationModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <p class="mb-4 text-lg font-semibold">Tem certeza que deseja excluir este produto?</p>
                <div class="flex justify-around gap-4">
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmDeleteBtn">Sim, Excluir</button>
                    <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelDeleteBtn">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmationModal);

        document.getElementById('confirmDeleteBtn').onclick = () => {
            this.productManager.deleteProduct(id);
            this.showMessage('Produto excluído com sucesso!');
            confirmationModal.remove();
            this.renderProductList(); // Atualiza a lista após exclusão
        };

        document.getElementById('cancelDeleteBtn').onclick = () => {
            confirmationModal.remove();
        };
    }

    /**
     * Limpa o formulário de cadastro/edição.
     */
    clearForm() {
        this.elements.productId.value = '';
        this.elements.productName.value = '';
        this.elements.productCategory.value = '';
        this.elements.productBrand.value = '';
        this.elements.productDetails.value = '';
        this.elements.productMeasure.value = '';
        this.elements.productPrice.value = '';
    }

    /**
     * Manipula a exportação de dados.
     */
    handleExportData() {
        const dataStr = JSON.stringify(this.productManager.products, null, 4);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'produtos.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage('Dados exportados com sucesso!');
    }

    /**
     * Manipula a cópia de dados.
     */
    handleCopyData() {
        const dataString = JSON.stringify(this.productManager.products, null, 4);

        navigator.clipboard.writeText(dataString)
            .then(() => {
                this.showMessage('Dados copiados para a área de transferência.');
            })
            .catch(err => {
                console.error('Falha ao copiar dados: ', err);
            });
    }

    /**
     * Manipula a importação de dados.
     */
    handleImportData() {
        const file = this.elements.importFile.files[0];

        if (!file) {
            this.showMessage('Por favor, selecione um arquivo JSON para importar.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedProductsData = JSON.parse(event.target.result);
                const { added, merged } = this.productManager.importData(importedProductsData);
                this.showMessage(`Dados importados com sucesso! ${added} novos produtos adicionados, ${merged} produtos atualizados.`);
                this.renderProductList(); // Atualiza a lista após importação
            } catch (e) {
                this.showMessage('Erro ao importar dados. Verifique se o arquivo é um JSON válido.', 'error');
                console.error("Erro ao importar dados:", e);
            }
        };
        reader.readAsText(file);
    }

    /**
     * Manipula o carregamento de dados de demonstração.
     */
    handleLoadDemoData() {
        this.productManager.loadDemoData();
        this.showMessage('Dados de demonstração carregados!');
        this.renderProductList(); // Atualiza a lista após carregar dados demo
    }

    /**
     * Exibe um modal de confirmação para limpar todos os dados.
     */
    confirmClearData() {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
        confirmationModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <p class="mb-4 text-lg font-semibold">Esta ação irá apagar TODOS os produtos. Tem certeza?</p>
                <div class="flex justify-around gap-4">
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmClearBtn">Sim, Limpar</button>
                    <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelClearBtn">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmationModal);

        document.getElementById('confirmClearBtn').onclick = () => {
            this.productManager.clearAllData();
            this.showMessage('Todos os dados foram limpos!', 'success');
            confirmationModal.remove();
            this.renderProductList(); // Atualiza a lista após limpar dados
        };

        document.getElementById('cancelClearBtn').onclick = () => {
            confirmationModal.remove();
        };
    }

    /**
     * Mostra a seção da aplicação e atualiza os botões da aba.
     * @param {string} sectionId - ID da seção a ser mostrada (ex: 'consultation').
     */
    showSection(sectionId) {
        this.elements.formSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId + 'Section').classList.add('active');

        this.elements.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.tab-button[data-section="${sectionId}"]`).classList.add('active');

        if (sectionId === 'consultation') {
            this.handleSearch(); // Atualiza a busca ao mudar para a seção de consulta
        }
    }

    /**
     * Rola a página para o topo.
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Alterna a visibilidade do botão "Voltar ao Topo".
     */
    toggleScrollToTopButton() {
        if (window.pageYOffset > 200) {
            this.elements.scrollToTopBtn.classList.remove('hidden');
            this.elements.scrollToTopBtn.classList.add('block');
        } else {
            this.elements.scrollToTopBtn.classList.remove('block');
            this.elements.scrollToTopBtn.classList.add('hidden');
        }
    }
}