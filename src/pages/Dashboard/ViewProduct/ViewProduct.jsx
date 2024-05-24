import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Space, Table, Modal, Form, Input, Alert } from "antd";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const ViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [productsName, setProductsName] = useState([]);
  const [shouldReloadData, setShouldReloadData] = useState(false);
  const [loadingCategoryId, setLoadingCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [form] = Form.useForm(); // Form hooks
  const [errorMessage, setErrorMessage] = useState(null); // State to manage error messages
  const userData = useSelector((state) => state.activeUser.value);

  // Function to handle sub-category deletion
  const handleDelete = async (productId) => {
    try {
      // Display confirmation modal before deletion
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Set loading state during deletion
          setLoadingCategoryId(productId);

          // Make API request to delete sub-category
          const response = await axios.delete(
            "http://localhost:7000/api/v1/products/deleteproduct",
            { data: { productId: productId } }
          );
          console.log(response);

          // Display success message using Swal
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: " Category Deleted!",
            showConfirmButton: false,
            timer: 1500,
          });

          // Trigger data reload and reset loading state
          setShouldReloadData(!shouldReloadData);
          setLoadingCategoryId("");
        }
      });
    } catch (error) {
      // Log and handle errors
      console.error("Error handling sub-category deletion:", error);
    }
  };

  // Edit section...
  const onFinish = async (values) => {
    console.log("Success:", values);
    const editCategoryData = {
      name: values.productName,
      id: editId,
    };

    // Make API request to edit sub-category
    const response = await axios.post(
      "http://localhost:7000/api/v1/products/eidtproduct",
      editCategoryData
    );
    console.log(response);

    // Handle response based on status
    if (
      response.status === 200 &&
      response.data === "Sub Category Already Exists"
    ) {
      setErrorMessage(
        "Category Already Exists. Please use a different category."
      );
    } else {
      // Display success message using Swal
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: " Category Updated!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Trigger data reload and reset loading state
      setShouldReloadData(!shouldReloadData);
      setLoadingCategoryId("");
      setIsModalOpen(false); // Close the modal after successful edit
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const showModal = (editId) => {
    setIsModalOpen(true);
    setEditId(editId);

    // Find the category data based on the editId
    const productToEdit = products.find((product) => product.key === editId);
    console.log(productToEdit);

    // Set initial values for the form fields
    form.setFieldsValue({
      productName: productToEdit.name,
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // Modal section end

  // Fetch all sub-categories from the API for display
  useEffect(() => {
    async function fetchAllSubCategories() {
      try {
        // Make API request to get all sub-categories
        const response = await axios.get(
          "http://localhost:7000/api/v1/products/viewproducts"
        );

        // console.log(response.data);

        // Transform the received data into the desired format
        const viewProductsData = response.data.data.map((item) => ({
          key: item._id,
          name: item.name,
          //   image: item.image,
          status: item.isActive ? "Approved" : "Pending",
        }));

        // Set the transformed data to the state
        setProducts(viewProductsData);
      } catch (error) {
        // Handle errors if any
        console.error("Error fetching sub-categories:", error);
      }
    }

    // Fetch sub-categories when the component mounts and whenever data should be reloaded
    fetchAllSubCategories();
  }, [shouldReloadData]);

  // Fetch all categories and associated sub-categories for display
  useEffect(() => {
    // Function to fetch all categories and associated sub-categories from the API
    const arr = [];
    async function fetchAllCategories() {
      try {
        // Make API request to get all sub-categories
        const response = await axios.get(
          "http://localhost:7000/api/v1/products/viewproducts"
        );
        // console.log("res", response.data);

        // Transform the received data into the desired format
        response.data.map((item) => {
          arr.push({
            key: item._id,
            name: item.name,
            description: item.description,
            // categoryName: item.categoryId?.name,
            status: item.isActive ? "Approved" : "Pending",
          });
          // console.log("item",item.categoryId?.name);
        });

        // Set the transformed data to the state
        setProductsName(arr);
        // console.log("subCategory", subCategories);
      } catch (error) {
        // Handle errors if any
        console.error("Error fetching categories:", error);
      }
    }

    // Fetch categories when the component mounts and whenever data should be reloaded
    fetchAllCategories();
  }, [shouldReloadData]);

  // Function to handle sub-category approval
  const handleApprove = async (approve) => {
    setLoadingCategoryId(approve.key);

    // Create request payload for sub-category approval
    const editCategoryData = {
      isActive: approve.status === "Approved" ? false : true,
      id: approve.key,
    };

    // Make API request to approve sub-category
    const response = await axios.post(
      "http://localhost:7000/api/v1/products/approvesubcategory",
      editCategoryData
    );

    // Handle response based on status
    if (response.status === 200 && response.data === "status changed!") {
      setErrorMessage("This category is approved !");
    } else {
      // Display success message using Swal
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: " Category Approved!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Trigger data reload and reset loading state
      setShouldReloadData(!shouldReloadData);
      setLoadingCategoryId("");
      //   setIsModalOpen(false); // Close the modal after successful edit
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Products Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {/* Render Edit button for Merchant role */}
          {userData.role === "Merchant" && (
            <Button onClick={() => showModal(record.key)}>Edit</Button>
          )}
          {/* Render Delete button for all roles */}
          <Button
            type="primary"
            danger
            ghost
            onClick={() => handleDelete(record.key)}
            loading={loadingCategoryId === record.key}
          >
            Delete
          </Button>
          {/* Render Approve/Hold button for Admin role */}
          {userData.role === "Admin" && (
            <Button
              type="primary"
              ghost
              onClick={() => handleApprove(record)}
              loading={loadingCategoryId === record.key}
            >
              {record.status === "Approved" ? "Hold" : "Approve"}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <>
        {/* Display section header */}
        <div className="flex justify-evenly">
          <h2 className="text-2xl font-semibold my-2">View Products</h2>
          <h2 className="text-2xl font-semibold my-2">
            Total products: {productsName.length}
          </h2>
        </div>
        {/* Render the table with columns and sub-category data */}
        <Table columns={columns} dataSource={productsName} />

        {/* Render Edit modal */}
        <Modal
          title="Edit Category"
          visible={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form
            form={form}
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            autoComplete="off"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Edit product Name"
              name="productName"
              rules={[
                {
                  required: true,
                  message: "Please input your Product Name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            {errorMessage && <Alert message={errorMessage} type="error" />}

            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button
                block
                htmlType="submit"
                className="my-2 bg-blue-500 text-white font-semibold"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        {/* Render Edit modal end */}
      </>
    </div>
  );
};

export default ViewProduct;
