import React, { useMemo } from "react";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import { useDispatch } from "react-redux";
import { saveFormDataAsync } from "../redux/formSlice";
import { basicSchema } from "../schema/basicSchema";
import Card from "./Card";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch } from "../redux/store"; // Import RootState and AppDispatch
import { Link } from "react-router-dom";

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface BankFormValues {
  bankName: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  email: string;
  addresses: Address[];
  id?: number; // Optional id for editing purposes
}

interface Option {
  value: string;
  label: string;
}

const BankForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); 
  const location = useLocation(); 
  const navigate = useNavigate();
  // const formStatus = useSelector((state: RootState) => state.form.status); 

  const bankOptions: Option[] = [
    { value: "Bank of Baroda", label: "Bank of Baroda" },
    { value: "HDFC Bank", label: "HDFC Bank" },
    { value: "ICICI Bank", label: "ICICI Bank" },
    { value: "IDFC First Bank", label: "IDFC First Bank" },
    { value: "Kotak Bank", label: "Kotak Bank" },
    { value: "SBI", label: "SBI" },
    { value: "Bank of Maharashtra", label: "Bank of Maharashtra" },
  ];

  const cityOptions: Option[] = [
    { value: "Thane", label: "Thane" },
    { value: "Mulund", label: "Mulund" },
    { value: "Bhandup", label: "Bhandup" },
    { value: "Ghatkopar", label: "Ghatkopar" },
  ];

  const stateOptions: Option[] = [
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Delhi", label: "Delhi" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kashmir", label: "Kashmir" },
  ];

  const countryOptions: Option[] = [
    { value: "India", label: "India" },
    { value: "Dubai", label: "Dubai" },
    { value: "USA", label: "USA" },
  ];

  const initialValues: BankFormValues = useMemo(() => {
    if (location.state && location.state.id !== undefined) {
      const storedData = JSON.parse(
        localStorage.getItem("bankFormData") || "[]"
      ) as BankFormValues[];
      console.log("Stored Data for editing:", storedData); // Log stored data
      const dataToEdit: BankFormValues =
        storedData.find((item) => item.id === location.state.id) || {
          bankName: "",
          ifscCode: "",
          branchName: "",
          accountHolderName: "",
          accountNumber: "",
          email: "",
          addresses: [
            {
              addressLine1: "",
              addressLine2: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            },
          ],
        };
      console.log("Data to Edit:", dataToEdit); // Log data that will be edited
      return dataToEdit;
    }
    return {
      bankName: "",
      ifscCode: "",
      branchName: "",
      accountHolderName: "",
      accountNumber: "",
      email: "",
      addresses: [
        {
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
      ],
    };
  }, [location.state]);

  const onSubmit = (
    values: BankFormValues,
    { resetForm }: FormikHelpers<BankFormValues>
  ) => {
    console.log("Submit button clicked")
    console.log("Form Values on Submit:", values); // Log form values on submit

    const existingData = JSON.parse(
      localStorage.getItem("bankFormData") || "[]"
    ) as BankFormValues[];
    console.log("Existing Data in localStorage:", existingData); // Log existing data

    if (values.id !== undefined) {
      const updatedData = existingData.map((item) =>
        item.id === values.id ? values : item
      );
      console.log("Updated Data for Editing:", updatedData); // Log updated data after editing
      localStorage.setItem("bankFormData", JSON.stringify(updatedData));
    } else {
      const newId = existingData.length
        ? Math.max(...existingData.map((item) => item.id || 0)) + 1
        : 0;
      const updatedData = [...existingData, { ...values, id: newId }];
      console.log("New Data with ID:", updatedData); // Log new data with the generated id
      localStorage.setItem("bankFormData", JSON.stringify(updatedData));
    }

    dispatch(saveFormDataAsync(values)).then(() => {
      console.log("Form data saved to Redux successfully"); // Log after successful Redux dispatch
      resetForm();
      navigate("/bank-details-list"); // Redirect to bank details page
    });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={basicSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ values }) => (
          <Form>
            {/* General Information Card */}
            <Card title="General Information">
              <div className="row">
                <div className="col-md-6">
                  <SelectInput
                    label="Bank Name*"
                    name="bankName"
                    options={bankOptions}
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label="IFSC Code*"
                    placeholder="Enter IFSC code"
                    name="ifscCode"
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label="Branch Name*"
                    placeholder="Enter Branch name"
                    name="branchName"
                  />
                </div>
              </div>
            </Card>

            {/* Multiple Addresses using FieldArray */}
            <FieldArray name="addresses">
              {({ remove, push }) => (
                <Card title="Address Information">
                  {values.addresses.length > 0 &&
                    values.addresses.map((address, index) => (
                      <div key={index}>
                        <div className="row mt-3">
                          <div className="col-md-6">
                            <TextInput
                              label="Address Line 1*"
                              placeholder="Enter Address"
                              name={`addresses.${index}.addressLine1`}
                            />
                          </div>
                          <div className="col-md-6">
                            <TextInput
                              label="Address Line 2"
                              placeholder="Enter Address"
                              name={`addresses.${index}.addressLine2`} 
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-3">
                            <SelectInput
                              label="City*"
                              name={`addresses.${index}.city`} 
                              options={cityOptions}
                            />
                          </div>
                          <div className="col-md-3">
                            <SelectInput
                              label="State*"
                              name={`addresses.${index}.state`} 
                              options={stateOptions}
                            />
                          </div>
                          <div className="col-md-3">
                            <SelectInput
                              label="Country*"
                              name={`addresses.${index}.country`} 
                              options={countryOptions}
                            />
                          </div>
                          <div className="col-md-3 mt-2">
                            <TextInput
                              label="Pincode*"
                              placeholder="Enter Pincode"
                              name={`addresses.${index}.pincode`} 
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between">
                          <button
                            type="button"
                            className="btn btn-primary mt-2"
                            onClick={() =>
                              push({
                                addressLine1: "",
                                addressLine2: "",
                                city: "",
                                state: "",
                                country: "",
                                pincode: "",
                              })
                            }
                          >
                            Add Another Address
                          </button>
                          {index > 0 && (
                            <button
                              type="button"
                              className="btn btn-danger mt-2"
                              onClick={() => remove(index)}
                            >
                              Remove Address
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </Card>
              )}
            </FieldArray>

            <Card title="Customer Information">
              <div className="row">
                <div className="col-md-6">
                  <TextInput
                    label="Account Holder Name*"
                    placeholder="Enter Account Holder Name"
                    name="accountHolderName"
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label="Account Number*"
                    placeholder="Enter Account Number"
                    name="accountNumber"
                  />
                </div>
                <div className="col-md-6">
                  <TextInput
                    label="Email*"
                    placeholder="Enter Email"
                    name="email"
                    type="email" 
                  />
                </div>
              </div>
            </Card>

            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-success mt-2">
                Submit
              </button>
              {/* <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={() => navigate("/bank-details-page")} 
              >
                View Bank Details
              </button> */}
              <Link to="/bank-details-list">
            <button className="btn btn-primary">View Submissions</button>
          </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BankForm;
