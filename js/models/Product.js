import { NOW } from '../constants/constants.js';

/**
 * Classe que representa um Produto.
 * Encapsula as propriedades e lógica relacionada a um produto.
 */
export class Product {
    constructor({ id, name, category, brand, details, measure, price, createdAt, updatedAt }) {
        this.id = id || this.generateId();
        this.name = name;
        this.category = category || null;
        this.brand = brand || null;
        this.details = details || null;
        this.measure = measure || null;
        this.price = price;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || null;
    }

    /**
     * Gera um ID único para o produto.
     * @returns {string} ID único.
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Atualiza as propriedades do produto.
     * @param {object} updates - Objeto com as propriedades a serem atualizadas.
     */
    update(updates) {
        Object.assign(this, updates);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Retorna o status da data do produto (novo, médio, antigo).
     * @returns {string} 'new', 'avg', 'old'.
     */
    getDateStatus() {
        const dateToCheck = this.updatedAt ? new Date(this.updatedAt) : new Date(this.createdAt);
        const oneMonthAgo = new Date(NOW);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const threeMonthsAgo = new Date(NOW);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (dateToCheck < threeMonthsAgo) {
            return 'old';
        } else if (dateToCheck < oneMonthAgo) {
            return 'avg';
        } else {
            return 'new';
        }
    }
}