const STORAGE_KEY = 'product_manager_data';
let products = [];
let scrollToTopBtn;

async function loadProducts() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        products = JSON.parse(data);
    } else {
        await loadDemoData();
    }
    displayProducts(products);
}

async function loadDemoData() {
    try {
        const response = await fetch('/data/demo_products.json');
        if (response.ok) {
            const demoData = await response.json();
            products = demoData.map(p => ({
                id: p.id || generateId(),
                name: p.name || '',
                category: p.category || null,
                brand: p.brand || null,
                details: p.details || null,
                measure: p.measure || null,
                price: p.price !== null && p.price !== undefined ? p.price : 0
            }));
            saveProducts();
            showMessage('Dados iniciais carregados de demo_products.json!');
        } else {
            products = [];
            showMessage('Não foi possível carregar dados iniciais de demo_products.json. Iniciando com lista vazia.', 'error');
            console.error('Erro ao carregar demo_products.json:', response.statusText);
        }
    } catch (e) {
        products = [];
        showMessage('Erro de rede ou JSON inválido ao carregar demo_products.json. Iniciando com lista vazia.', 'error');
        console.error('Erro ao carregar demo_products.json:', e);
    }
}

async function overwriteProducts() {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    confirmationModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h4 class="mb-4 text-xl font-bold">Você já possui produtos armazenados localmente em seu dispositivo</h4>
            <p class="mb-4 text-lg font-semibold">Tem certeza que deseja sobrescrever os dados armazenados pelos dados de demonstração?</p>
            <div class="flex justify-around gap-4">
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmOverwriteBtn">Sim, Sobrescrever</button>
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelOverwriteBtn">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    document.getElementById('confirmOverwriteBtn').onclick = async () => {
        try {
            const response = await fetch('/data/demo_products.json');
            if (response.ok) {
                const demoData = await response.json();
                products = demoData.map(p => ({
                    id: p.id || generateId(),
                    name: p.name || '',
                    category: p.category || null,
                    brand: p.brand || null,
                    details: p.details || null,
                    measure: p.measure || null,
                    price: p.price !== null && p.price !== undefined ? p.price : 0
                }));
                saveProducts();
                searchProducts();
                showMessage('Dados sobrescritos com sucesso!');
            } else {
                showMessage('Erro ao carregar dados de demonstração para sobrescrever.', 'error');
                console.error('Erro ao carregar demo_products.json para sobrescrever:', response.statusText);
            }
        } catch (e) {
            showMessage('Erro de rede ou JSON inválido ao sobrescrever dados.', 'error');
            console.error('Erro ao sobrescrever dados:', e);
        } finally {
            confirmationModal.remove();
        }
    };

    document.getElementById('cancelOverwriteBtn').onclick = async () => {
        try {
            const response = await fetch('/data/demo_products.json');
            if (response.ok) {
                const demoData = await response.json();
                let productsAdded = 0;
                demoData.forEach(importedProduct => {
                    const importedProductNameLower = (importedProduct.name || '').toLowerCase();
                    const existingProductIndex = products.findIndex(p => (p.name || '').toLowerCase() === importedProductNameLower);

                    if (existingProductIndex === -1) {
                        products.push({
                            id: importedProduct.id || generateId(),
                            name: importedProduct.name || '',
                            category: importedProduct.category || null,
                            brand: importedProduct.brand || null,
                            details: importedProduct.details || null,
                            measure: importedProduct.measure || null,
                            price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                        });
                        productsAdded++;
                    }
                });
                saveProducts();
                searchProducts();
                showMessage(`Dados de demonstração mesclados: ${productsAdded} novos produtos adicionados.`);
            } else {
                showMessage('Erro ao carregar dados de demonstração para mesclagem.', 'error');
                console.error('Erro ao carregar demo_products.json para mesclagem:', response.statusText);
            }
        } catch (e) {
            showMessage('Erro de rede ou JSON inválido ao mesclar dados.', 'error');
            console.error('Erro ao mesclar dados:', e);
        } finally {
            confirmationModal.remove();
        }
    };
}

function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    showMessage('Dados salvos com sucesso!');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;
    setTimeout(() => {
        messageBox.className = `message-box ${type}`;
    }, 3000);
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (productsToDisplay.length === 0) {
        productList.innerHTML = '<p class="text-gray-500 text-center">Nenhum produto encontrado.</p>';
        return;
    }

    productsToDisplay.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
                    <div class="details flex-grow">
                        <strong>Nome:</strong> <span>${product.name || 'N/A'}</span><br>
                        <strong>Categoria:</strong> <span>${product.category || 'N/A'}</span><br>
                        <strong>Marca:</strong> <span>${product.brand || 'N/A'}</span><br>
                        <strong>Detalhes:</strong> <span>${product.details || 'N/A'}</span><br>
                        <strong>Medida:</strong> <span>${product.measure || 'N/A'}</span><br>
                        <strong>Preço:</strong> <span>${product.price !== null && product.price !== undefined ? `R$ ${product.price.toFixed(2)}` : 'N/A'}</span>
                    </div>
                    <div class="actions flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <button onclick="editProduct('${product.id}')" class="secondary">Editar</button>
                        <button onclick="deleteProduct('${product.id}')" class="danger">Excluir</button>
                    </div>
                `;
        productList.appendChild(productDiv);
    });
}

function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const brand = document.getElementById('productBrand').value.trim();
    const details = document.getElementById('productDetails').value.trim();
    const measure = document.getElementById('productMeasure').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);

    if (!name) {
        showMessage('O nome do produto é obrigatório!', 'error');
        return;
    }
    if (isNaN(price)) {
        showMessage('O preço deve ser um número válido!', 'error');
        return;
    }

    let productIndex = -1;
    if (id) {
        productIndex = products.findIndex(p => p.id === id);
    } else {
        productIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    }

    if (productIndex > -1) {
        products[productIndex] = {
            id: products[productIndex].id,
            name: name,
            category: category || null,
            brand: brand || null,
            details: details || null,
            measure: measure || null,
            price: price
        };
        showMessage('Produto atualizado com sucesso!');
    } else {
        const newProduct = {
            id: generateId(),
            name: name,
            category: category || null,
            brand: brand || null,
            details: details || null,
            measure: measure || null,
            price: price
        };
        products.push(newProduct);
        showMessage('Produto adicionado com sucesso!');
    }

    saveProducts();
    clearForm();
    searchProducts();
    showSection('consultation');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productDetails').value = product.details || '';
        document.getElementById('productMeasure').value = product.measure || '';
        document.getElementById('productPrice').value = product.price;
        showSection('registration');
    }
}

function deleteProduct(id) {
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
        products = products.filter(p => p.id !== id);
        saveProducts();
        searchProducts();
        showMessage('Produto excluído com sucesso!');
        confirmationModal.remove();
    };

    document.getElementById('cancelDeleteBtn').onclick = () => {
        confirmationModal.remove();
    };
}

function clearForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productBrand').value = '';
    document.getElementById('productDetails').value = '';
    document.getElementById('productMeasure').value = '';
    document.getElementById('productPrice').value = '';
}

function getSearchByValue() {
    const radioButtons = document.querySelectorAll(`input[type="radio"][name="searchBy"]`);

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            return radioButton.value;
        }
    }

    return null;
}

function searchProducts() {
    const searchBarValue = document.getElementById('searchBar').value.toLowerCase();
    const searchBy = getSearchByValue();

    const searchTermName = searchBy === 'name' ? searchBarValue : '';
    const searchTermCategory = searchBy === 'category' ? searchBarValue : '';
    const searchTermDetails = searchBy === 'details' ? searchBarValue : '';

    const filteredProducts = products.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTermName);
        const categoryMatch = product.category && product.category.toLowerCase().includes(searchTermCategory);
        const detailsMatch = product.details && product.details.toLowerCase().includes(searchTermDetails);

        return nameMatch && categoryMatch && detailsMatch;
    });
    displayProducts(filteredProducts);
}

function exportData() {
    const dataStr = JSON.stringify(products, null, 4); // Formata com 4 espaços
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('Dados exportados com sucesso!');
}

function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Por favor, selecione um arquivo JSON para importar.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const importedProducts = JSON.parse(event.target.result);
            let productsMerged = 0;
            let productsAdded = 0;

            importedProducts.forEach(importedProduct => {
                const importedProductNameLower = (importedProduct.name || '').toLowerCase();
                const existingProductIndex = products.findIndex(p => (p.name || '').toLowerCase() === importedProductNameLower);

                if (existingProductIndex > -1) {
                    products[existingProductIndex] = {
                        id: products[existingProductIndex].id,
                        name: importedProduct.name || '',
                        category: importedProduct.category || null,
                        brand: importedProduct.brand || null,
                        details: importedProduct.details || null,
                        measure: importedProduct.measure || null,
                        price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                    };
                    productsMerged++;
                } else {
                    products.push({
                        id: importedProduct.id || generateId(), // Usa o ID importado ou gera um novo
                        name: importedProduct.name || '',
                        category: importedProduct.category || null,
                        brand: importedProduct.brand || null,
                        details: importedProduct.details || null,
                        measure: importedProduct.measure || null,
                        price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                    });
                    productsAdded++;
                }
            });

            saveProducts();
            searchProducts();
            showMessage(`Dados importados com sucesso! ${productsAdded} novos produtos adicionados, ${productsMerged} produtos atualizados.`);
        } catch (e) {
            showMessage('Erro ao importar dados. Verifique se o arquivo é um JSON válido.', 'error');
            console.error("Erro ao importar dados:", e); // Para depuração
        }
    };
    reader.readAsText(file);
}

function confirmClearData() {
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
        products = [];
        saveProducts();
        searchProducts()
        showMessage('Todos os dados foram limpos!', 'success');
        confirmationModal.remove();
    };

    document.getElementById('cancelClearBtn').onclick = () => {
        confirmationModal.remove();
    };
}


function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + 'Section').classList.add('active');

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[onclick="showSection('${sectionId}')"]`).classList.add('active');

    if (sectionId === 'consultation') {
        searchProducts();
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleScrollToTopButton() {
    if (window.pageYOffset > 200) { // Mostra o botão se a página rolou mais de 200px
        scrollToTopBtn.classList.remove('hidden');
        scrollToTopBtn.classList.add('block');
    } else {
        scrollToTopBtn.classList.remove('block');
        scrollToTopBtn.classList.add('hidden');
    }
}

window.onload = async () => {
    scrollToTopBtn = document.createElement('div');
    searchBar = document.getElementById('searchBar');
    scrollToTopBtn.id = 'scrollToTopBtn';
    scrollToTopBtn.className = 'fixed w-fit bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hidden';
    scrollToTopBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    `;
    scrollToTopBtn.onclick = scrollToTop;
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', toggleScrollToTopButton);
    searchBar.oninput = searchProducts;

    await loadProducts();
    showSection('consultation');
};