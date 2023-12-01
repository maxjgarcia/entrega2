import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';



class ProductManager {
  constructor(path) {
    this.path = path;
  }


  async getProducts() {
    try {
      const content = JSON.parse(await fs.readFile(`./${this.path}`, 'utf-8'));
      return content
    } catch (error) {
      console.log(error);
      throw new Error(`Error reading products: ${error.message}`);
    }
  }

  validateProductData(productData) {
    const { title, description, price, stock, thumbnail } = productData
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new Error('Invalid product title')
    }
    if (!description || typeof description !== "string" || description.trim() === "") {
      throw new Error('Invalid product description')
    }
    if (!price || typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid product price');
    }
    if (!stock || typeof stock !== 'number' || stock < 0) {
      throw new Error('Invalid product stock');
    }
    if (!thumbnail || !Array.isArray(thumbnail) || thumbnail.length === 0) {
      throw new Error('Invalid product thumbnail');
    }
  }

  async addProduct(productData) {
    try {
      this.validateProductData(productData)
      const products = await this.getProducts()
      const id = products.length + 1;
      const code = randomUUID();
      const newProduct = { id, code, ...productData };
      products.push(newProduct);
      await fs.writeFile(`./${this.path}`, JSON.stringify(products, null, 2));
      console.log('New product added:', newProduct);
      return products;
    } catch (error) {
      throw new Error(`Error adding product: ${error.message}`);
    }
  }

  async getProductById(productId) {
    try {
      const products = await this.getProducts()
      const foundProduct = products.find((p) => p.id === productId);
      return foundProduct ? [foundProduct] : console.log('Product not found.');
    } catch (error) {
      throw new Error(`Error getting product by ID: ${error.message}`);
    }
  }

  async updateProductById(productId, productData) {
    try {
      const products = await this.getProducts()
      const productIndex = products.findIndex((p) => p.id === productId);
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          ...productData,
        };
        await fs.writeFile(`./${this.path}`, JSON.stringify(products, null, 2), 'utf-8');
        console.log('Product updated successfully.');
        return products
      } else {
        console.log('Product not found.');
        return null
      }
    } catch (error) {
      throw new Error(`Error updating product by ID: ${error.message}`);
    }
  }

  async deleteProductById(productId) {
    try {
      const products = await this.getProducts()
      const productIndex = products.findIndex((p) => p.id === productId);
      if (productIndex === -1) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      const productsFilt = products.filter((p) => p.id !== productId);
      await fs.writeFile(`./${this.path}`, JSON.stringify(productsFilt, null, 2));
      console.log(`Product with Id: ${productId} is deleted`);
      return productsFilt
    } catch (error) {
      throw new Error(`Error deleting product by ID: ${error.message}`);
    }
  }
}

const productManager = new ProductManager('products.json');

// console.log(await productManager.getProducts());