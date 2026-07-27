import React, { useEffect, useState } from "react";
import "./Categories.css";
import categoryApi from "../api/categoryApi";

function CategoryDialog({ category, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState(category?.categoryName || "");

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = categoryName.trim();
    if (!value) {
      alert("Category name is required.");
      return;
    }

    onSave({
      ...(category?.id ? { id: category.id } : {}),
      categoryName: value,
    });
  };

  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog category-dialog">
        <h3>{category ? "Edit Category" : "Add Category"}</h3>

        <form className="addbuyerform" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label htmlFor="categoryName">Category Name</label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              required
            />
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState("");

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load categories.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (payload) => {
    try {
      setMessage("");
      await categoryApi.create(payload);
      await loadCategories();
      setShowCreateDialog(false);
      setMessage("Category created successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create category.");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setMessage("");
      await categoryApi.update(payload.id, payload);
      await loadCategories();
      setSelectedCategory(null);
      setShowEditDialog(false);
      setMessage("Category updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      setMessage("");
      await categoryApi.delete(id);
      await loadCategories();
      setMessage("Category deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete category.");
    }
  };

  return (
    <>
      <div className="buyermainarea categories-page">
        <h1>Categories</h1>

        <div className="categories-toolbar">
          <button type="button" onClick={() => setShowCreateDialog(true)}>
            Add Category
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>{category.categoryName}</td>
                  <td>
                    <div className="buyers-actions">
                      <button
                        type="button"
                        className="editbutton"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowEditDialog(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="deletebutton"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-categories-row">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {message && <p className="categories-message">{message}</p>}
      </div>

      {showCreateDialog && (
        <CategoryDialog
          onSave={handleCreate}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {showEditDialog && selectedCategory && (
        <CategoryDialog
          category={selectedCategory}
          onSave={handleUpdate}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </>
  );
}

export default Categories;