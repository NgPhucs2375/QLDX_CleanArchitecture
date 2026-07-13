import { App as AntdApp, ConfigProvider } from "antd";
import React from "react";
import {
  AuthPage,
  ErrorComponent,
  ImageField,
  ThemedLayoutV2,
  ThemedTitleV2,
  useNotificationProvider,
} from "@refinedev/antd";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { resources, themeConfig } from "./config";
import { Authenticated, CanAccess, Refine } from "@refinedev/core";
import { accessControlProvider, authProvider, dataProvider } from "./providers";
import {
  CloneUser,
  CreateUser,
  EditUser,
  ListUser,
  ShowUser,
} from "@routes/identity/users";
import {
  CloneProduct,
  CloneRole,
  CloneRoleClaim,
  CreateProduct,
  CreateRangeProduct,
  CreateRole,
  CreateRoleClaim,
  Dashboard,
  EditProduct,
  EditRole,
  EditRoleClaim,
  ListProduct,
  ListRole,
  ListRoleClaim,
  ShowProduct,
  ShowRole,
  ShowRoleClaim,
  CreateCategory,
  EditCategory,
  ListCategory,
  ShowCategory,
  CreateDepartment,
  EditDepartment,
  ListDepartment,
  ShowDepartment,
  CreateProposalConfig,
  EditProposalConfig,
  ListProposalConfig,
  ShowProposalConfig,
  CreateConfigCategory,
  EditConfigCategory,
  ListConfigCategory,
  ShowConfigCategory,
  CreateConfigApprover,
  EditConfigApprover,
  ListConfigApprover,
  ShowConfigApprover,
  CreatePurchaseRequest,
  EditPurchaseRequest,
  ListPurchaseRequest,
  ShowPurchaseRequest,
  CreatePurchaseRequestCategory,
  EditPurchaseRequestCategory,
  ListPurchaseRequestCategory,
  ShowPurchaseRequestCategory,
  CreatePurchaseRequestItem,
  EditPurchaseRequestItem,
  ListPurchaseRequestItem,
  ShowPurchaseRequestItem,
  CreatePurchaseRequestLog,
  EditPurchaseRequestLog,
  ListPurchaseRequestLog,
  ShowPurchaseRequestLog,
} from "./routes";
import { Unauthorized } from "@components/unauthorized";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            accessControlProvider={accessControlProvider}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
            resources={resources}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2
                      Title={({ collapsed }: { collapsed: boolean }) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          icon={
                            <ImageField
                              value="https://static.vietbank.com.vn/web/vietbank-logo.png"
                              title="Vietbank Logo"
                              style={{ width: 30, height: 30 }}
                            />
                          }
                          text="Vietbank Admin"
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="dashboard" />}
                />
                <Route path="dashboard">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="dashboard"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <Dashboard />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="products">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="products"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListProduct />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="products"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateProduct />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create-range"
                    element={
                      <CanAccess
                        resource="products"
                        action="create-range"
                        fallback={<Unauthorized />}
                      >
                        <CreateRangeProduct />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/clone"
                    element={
                      <CanAccess
                        resource="products"
                        action="clone"
                        fallback={<Unauthorized />}
                      >
                        <CloneProduct />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="products"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditProduct />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="products"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowProduct />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="categories">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="categories"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="categories"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="categories"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="categories"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowCategory />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="departments">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="departments"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListDepartment />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="departments"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateDepartment />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="departments"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditDepartment />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="departments"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowDepartment />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="proposal-configs">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="proposal-configs"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListProposalConfig />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="proposal-configs"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateProposalConfig />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="proposal-configs"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditProposalConfig />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="proposal-configs"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowProposalConfig />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="config-categories">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="config-categories"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListConfigCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="config-categories"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateConfigCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="config-categories"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditConfigCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="config-categories"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowConfigCategory />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="config-approvers">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="config-approvers"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListConfigApprover />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="config-approvers"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateConfigApprover />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="config-approvers"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditConfigApprover />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="config-approvers"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowConfigApprover />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="purchase-requests">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="purchase-requests"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListPurchaseRequest />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="purchase-requests"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreatePurchaseRequest />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="purchase-requests"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditPurchaseRequest />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="purchase-requests"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowPurchaseRequest />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="purchase-request-categories">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="purchase-request-categories"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListPurchaseRequestCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="purchase-request-categories"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreatePurchaseRequestCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="purchase-request-categories"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditPurchaseRequestCategory />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="purchase-request-categories"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowPurchaseRequestCategory />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="purchase-request-items">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="purchase-request-items"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListPurchaseRequestItem />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="purchase-request-items"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreatePurchaseRequestItem />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="purchase-request-items"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditPurchaseRequestItem />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="purchase-request-items"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowPurchaseRequestItem />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="purchase-request-logs">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="purchase-request-logs"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListPurchaseRequestLog />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="purchase-request-logs"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreatePurchaseRequestLog />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="purchase-request-logs"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditPurchaseRequestLog />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="purchase-request-logs"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowPurchaseRequestLog />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="users">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="users"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListUser />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="users"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateUser />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/clone"
                    element={
                      <CanAccess
                        resource="users"
                        action="clone"
                        fallback={<Unauthorized />}
                      >
                        <CloneUser />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="users"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditUser />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="users"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowUser />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="roles">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="roles"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListRole />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="roles"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateRole />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/clone"
                    element={
                      <CanAccess
                        resource="roles"
                        action="clone"
                        fallback={<Unauthorized />}
                      >
                        <CloneRole />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="roles"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditRole />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="roles"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowRole />
                      </CanAccess>
                    }
                  />
                </Route>
                <Route path="roleclaims">
                  <Route
                    index
                    element={
                      <CanAccess
                        resource="roleclaims"
                        action="list"
                        fallback={<Unauthorized />}
                      >
                        <ListRoleClaim />
                      </CanAccess>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <CanAccess
                        resource="roleclaims"
                        action="create"
                        fallback={<Unauthorized />}
                      >
                        <CreateRoleClaim />
                      </CanAccess>
                    }
                  />

                  <Route
                    path=":id/clone"
                    element={
                      <CanAccess
                        resource="roleclaims"
                        action="clone"
                        fallback={<Unauthorized />}
                      >
                        <CloneRoleClaim />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <CanAccess
                        resource="roleclaims"
                        action="edit"
                        fallback={<Unauthorized />}
                      >
                        <EditRoleClaim />
                      </CanAccess>
                    }
                  />
                  <Route
                    path=":id"
                    element={
                      <CanAccess
                        resource="roleclaims"
                        action="show"
                        fallback={<Unauthorized />}
                      >
                        <ShowRoleClaim />
                      </CanAccess>
                    }
                  />
                </Route>
              </Route>
              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      title={
                        <ThemedTitleV2
                          icon={
                            <ImageField
                              value="https://static.vietbank.com.vn/web/vietbank-logo.png"
                              title="Vietbank Logo"
                              style={{ width: 30, height: 30 }}
                            />
                          }
                          text="Vietbank Admin"
                          collapsed={false}
                        />
                      }
                      forgotPasswordLink={false}
                      registerLink={false}
                      formProps={{
                        initialValues: {
                          email: "",
                          password: "",
                        },
                      }}
                    />
                  }
                />
              </Route>
              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayoutV2>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
