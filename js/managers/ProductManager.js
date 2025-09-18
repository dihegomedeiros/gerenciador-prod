import { demoProducts } from "../data/demoData.js";
import { STORAGE_KEY } from '../constants/constants.js';
import { Product } from '../models/Product.js';

/**
 * Classe ProductManager (Singleton).
 * Gerencia a coleção de produtos e a persistência de dados.
 */
export class ProductManager {
    static instance = null;

    constructor() {
        if (ProductManager.instance) {
            return ProductManager.instance;
        }
        this.products = this.loadProducts();
        ProductManager.instance = this;
    }

    /**
     * Obtém a instância única do ProductManager.
     * @returns {ProductManager} A instância do ProductManager.
     */
    static getInstance() {
        if (!ProductManager.instance) {
            ProductManager.instance = new ProductManager();
        }
        return ProductManager.instance;
    }

    /**
     * Carrega os produtos do localStorage.
     * @returns {Array<Product>} Lista de produtos.
     */
    loadProducts() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            // Mapeia os dados brutos para instâncias da classe Product
            return JSON.parse(data).map(p => new Product(p));
        }
        return [];
    }

    /**
     * Salva os produtos no localStorage.
     */
    saveProducts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
    }

    /**
     * Adiciona ou atualiza um produto.
     * @param {object} productData - Dados do produto a ser salvo.
     * @returns {Product} O produto salvo/atualizado.
     */
    saveProduct(productData) {
        let product = null;
        if (productData.id) {
            // Tenta encontrar o produto pelo ID
            const index = this.products.findIndex(p => p.id === productData.id);
            if (index > -1) {
                product = this.products[index];
                product.update(productData);
            }
        }

        if (!product) {
            // Se não encontrou pelo ID ou não tem ID, tenta encontrar pelo nome para evitar duplicatas
            const existingProductByName = this.products.find(p => p.name.toLowerCase() === productData.name.toLowerCase());
            if (existingProductByName) {
                product = existingProductByName;
                product.update(productData);
            } else {
                // Se não existe, cria um novo produto
                product = new Product(productData);
                this.products.push(product);
            }
        }

        this.saveProducts();
        return product;
    }

    /**
     * Busca um produto pelo ID.
     * @param {string} id - ID do produto.
     * @returns {Product|undefined} O produto encontrado ou undefined.
     */
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    /**
     * Deleta um produto pelo ID.
     * @param {string} id - ID do produto a ser deletado.
     */
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
    }

    // Função auxiliar para remover acentos e cedilhas
    normalizeText(text) {
        return text
            .normalize("NFD")               // separa letras de acentos
            .replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/ç/g, "c")              // trata o "ç"
            .replace(/Ç/g, "C")
            .toLowerCase();
    }

    /**
     * Filtra e busca produtos.
     * @param {string} searchTerm - Termo de busca.
     * @param {string} searchBy - Critério de busca ('name', 'category', 'details').
     * @returns {Array<Product>} Lista de produtos filtrados.
     */
    searchProducts(searchTerm, searchBy) {
        if (!searchTerm.trim()) {
            return [...this.products]; // Retorna uma cópia para não modificar o array original
        }

        const normalizedSearchTerm = this.normalizeText(searchTerm);

        return this.products.filter(product => {
            switch (searchBy) {
                case 'name':
                    return product.name && this.normalizeText(product.name).includes(normalizedSearchTerm);
                case 'category':
                    return product.category && this.normalizeText(product.category).includes(normalizedSearchTerm);
                case 'details':
                    return product.details && this.normalizeText(product.details).includes(normalizedSearchTerm);
                default:
                    return false;
            }
        });
    }


    /**
     * Carrega dados de demonstração.
     */
    loadDemoData() {
        this.products = demoProducts.map(p => new Product(p));
        this.saveProducts();
    }

    /**
     * Limpa todos os dados.
     */
    clearAllData() {
        this.products = [];
        this.saveProducts();
    }

    /**
     * Importa dados de um array de produtos.
     * @param {Array<object>} importedProductsData - Array de objetos de produto.
     * @returns {{added: number, merged: number}} Contagem de produtos adicionados e atualizados.
     */
    importData(importedProductsData) {
        let productsMerged = 0;
        let productsAdded = 0;

        importedProductsData.forEach(importedProductData => {
            const importedProductNameLower = (importedProductData.name || '').toLowerCase();
            const existingProductIndex = this.products.findIndex(p => (p.name || '').toLowerCase() === importedProductNameLower);

            if (existingProductIndex > -1) {
                // Atualiza produto existente
                this.products[existingProductIndex].update({
                    name: importedProductData.name || '',
                    category: importedProductData.category || null,
                    brand: importedProductData.brand || null,
                    details: importedProductData.details || null,
                    measure: importedProductData.measure || null,
                    price: importedProductData.price !== null && importedProductData.price !== undefined ? importedProductData.price : 0,
                    createdAt: importedProductData.createdAt, // Mantém o createdAt original
                    updatedAt: new Date().toISOString() // Atualiza o updatedAt
                });
                productsMerged++;
            } else {
                // Adiciona novo produto
                this.products.push(new Product({
                    id: importedProductData.id || new Product({}).generateId(), // Garante um ID se não houver
                    name: importedProductData.name || '',
                    category: importedProductData.category || null,
                    brand: importedProductData.brand || null,
                    details: importedProductData.details || null,
                    measure: importedProductData.measure || null,
                    price: importedProductData.price !== null && importedProductData.price !== undefined ? importedProductData.price : 0,
                    createdAt: importedProductData.createdAt || new Date().toISOString(),
                    updatedAt: importedProductData.updatedAt || null
                }));
                productsAdded++;
            }
        });
        this.saveProducts();
        return { added: productsAdded, merged: productsMerged };
    }
}