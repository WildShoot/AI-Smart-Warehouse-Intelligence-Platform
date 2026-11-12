import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";

import "./Inventory.css";

const API_URL = "http://127.0.0.1:5000/api/products";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    sku: "",
    quantity: "",
    reorder_level: "",
    price: "",
  });

  // Get JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch products from MongoDB
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setProducts(data.products);
      } else {
        console.error(data.message || data.msg || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open Add Product Modal
  const handleAddProduct = () => {
    setEditMode(false);
    setSelectedProduct(null);

    setFormData({
      product_name: "",
      category: "",
      sku: "",
      quantity: "",
      reorder_level: "",
      price: "",
    });

    setShowModal(true);
  };

  // Open Edit Product Modal
  const handleEdit = (product) => {
    setEditMode(true);
    setSelectedProduct(product);

    setFormData({
      product_name: product.product_name,
      category: product.category,
      sku: product.sku,
      quantity: product.quantity,
      reorder_level: product.reorder_level,
      price: product.price,
    });

    setShowModal(true);
  };

  // Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      let response;

      if (editMode) {
        response = await fetch(
          `${API_URL}/${selectedProduct.sku}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              product_name: formData.product_name,
              category: formData.category,
              quantity: Number(formData.quantity),
              reorder_level: Number(formData.reorder_level),
              price: Number(formData.price),
            }),
          }
        );
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            product_name: formData.product_name,
            category: formData.category,
            sku: formData.sku,
            quantity: Number(formData.quantity),
            reorder_level: Number(formData.reorder_level),
            price: Number(formData.price),
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        alert(
          editMode
            ? "Product updated successfully"
            : "Product added successfully"
        );

        setShowModal(false);

        fetchProducts();
      } else {
        alert(
          data.message ||
          data.msg ||
          "Something went wrong"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Unable to connect to server");
    }
  };

  // Delete Product
  const handleDelete = async (sku) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/${sku}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product deleted successfully");

        fetchProducts();
      } else {
        alert(
          data.message ||
          data.msg ||
          "Unable to delete product"
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Unable to connect to server");
    }
  };

  // Search Products
  const filteredProducts = products.filter((product) =>
    product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    product.sku
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    product.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-page">

      {/* Header */}

      <div className="inventory-header">

        <div>
          <h1>Inventory Management</h1>
          <p>Monitor and manage warehouse products</p>
        </div>

        <div className="inventory-actions-top">

          <div className="product-count">
            <Package size={20} />
            <span>{products.length} Products</span>
          </div>

          <button
            className="add-product-btn"
            onClick={handleAddProduct}
          >
            <Plus size={21} />
            Add Product
          </button>

        </div>

      </div>


      {/* Search Bar */}

      <div className="search-container">

        <Search size={21} />

        <input
          type="text"
          placeholder="Search by product name, SKU or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

      </div>


      {/* Product Table */}

      <div className="inventory-table-container">

        <table className="inventory-table">

          <thead>

            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            {filteredProducts.length > 0 ? (

              filteredProducts.map((product) => {

                const isLowStock =
                  Number(product.quantity) <=
                  Number(product.reorder_level);

                return (

                  <tr key={product._id || product.sku}>

                    <td>{product.sku}</td>

                    <td className="product-name">
                      {product.product_name}
                    </td>

                    <td>{product.category}</td>

                    <td>{product.quantity}</td>

                    <td>{product.reorder_level}</td>

                    <td>
                      ₹ {product.price}
                    </td>


                    {/* STATUS */}

                    <td>

                      {isLowStock ? (

                        <span className="status-badge low-stock">

                          <AlertTriangle size={15} />

                          Low Stock

                        </span>

                      ) : (

                        <span className="status-badge healthy">

                          Healthy

                        </span>

                      )}

                    </td>


                    {/* ACTION BUTTONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil size={18} />
                        </button>


                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(product.sku)
                          }
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="no-products"
                >
                  No products found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="product-modal">

            <div className="modal-header">

              <h2>
                {editMode
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={25} />
              </button>

            </div>


            <form onSubmit={handleSubmit}>


              <div className="form-group">

                <label>Product Name</label>

                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>SKU</label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={editMode}
                  required
                />

              </div>


              <div className="form-group">

                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>Reorder Level</label>

                <input
                  type="number"
                  name="reorder_level"
                  value={formData.reorder_level}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>Price</label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="modal-buttons">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="submit-btn"
                >
                  {editMode
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Inventory; 