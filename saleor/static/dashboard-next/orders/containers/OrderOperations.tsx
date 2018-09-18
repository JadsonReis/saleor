import * as React from "react";

import {
  MutationProviderProps,
  MutationProviderRenderProps,
  PartialMutationProviderOutput
} from "../..";
import {
  OrderCaptureMutation,
  OrderCaptureMutationVariables,
  OrderCreateFulfillmentMutation,
  OrderCreateFulfillmentMutationVariables,
  OrderRefundMutation,
  OrderRefundMutationVariables
} from "../../gql-types";
import { maybe } from "../../misc";
import { OrderAddNote, OrderAddNoteVariables } from "../types/OrderAddNote";
import OrderCreateFulfillmentProvider from "./OrderCreateFulfillment";
import OrderNoteAddProvider from "./OrderNoteAdd";
import OrderPaymentCaptureProvider from "./OrderPaymentCapture";
import OrderPaymentRefundProvider from "./OrderPaymentRefund";

interface OrderOperationsProps extends MutationProviderProps {
  order: string;
  children: MutationProviderRenderProps<{
    orderAddNote: PartialMutationProviderOutput<
      OrderAddNote,
      OrderAddNoteVariables
    >;
    orderCreateFulfillment: PartialMutationProviderOutput<
      OrderCreateFulfillmentMutation,
      OrderCreateFulfillmentMutationVariables
    >;
    orderPaymentCapture: PartialMutationProviderOutput<
      OrderCaptureMutation,
      OrderCaptureMutationVariables
    >;
    orderPaymentRefund: PartialMutationProviderOutput<
      OrderRefundMutation,
      OrderRefundMutationVariables
    >;
  }>;
  onFulfillmentCreate: (data: OrderCreateFulfillmentMutation) => void;
  onNoteAdd: (data: OrderAddNote) => void;
  onPaymentCapture: (data: OrderCaptureMutation) => void;
  onPaymentRefund: (data: OrderRefundMutation) => void;
}

const OrderOperations: React.StatelessComponent<OrderOperationsProps> = ({
  children,
  order,
  onError,
  onFulfillmentCreate,
  onNoteAdd,
  onPaymentCapture,
  onPaymentRefund
}) => (
  <OrderPaymentCaptureProvider
    id={order}
    onError={onError}
    onSuccess={onPaymentCapture}
  >
    {paymentCapture => (
      <OrderPaymentRefundProvider
        id={order}
        onError={onError}
        onSuccess={onPaymentRefund}
      >
        {paymentRefund => (
          <OrderCreateFulfillmentProvider
            id={order}
            onError={onError}
            onSuccess={onFulfillmentCreate}
          >
            {createFulfillment => (
              <OrderNoteAddProvider onError={onError} onSuccess={onNoteAdd}>
                {addNote =>
                  children({
                    errors: [
                      ...maybe(
                        () => createFulfillment.data.fulfillmentCreate.errors,
                        [] as any
                      ),
                      ...maybe(() => addNote.data.orderAddNote.errors, []),
                      ...maybe(
                        () => paymentCapture.data.orderCapture.errors,
                        [] as any
                      ),
                      ...maybe(
                        () => paymentRefund.data.orderRefund.errors,
                        [] as any
                      )
                    ],
                    orderAddNote: {
                      data: addNote.data,
                      loading: addNote.loading,
                      mutate: variables => addNote.mutate({ variables })
                    },
                    orderCreateFulfillment: {
                      data: createFulfillment.data,
                      loading: createFulfillment.loading,
                      mutate: variables =>
                        createFulfillment.mutate({
                          variables: {
                            ...variables,
                            input: { ...variables.input, order }
                          }
                        })
                    },
                    orderPaymentCapture: {
                      data: paymentCapture.data,
                      loading: paymentCapture.loading,
                      mutate: variables => paymentCapture.mutate({ variables })
                    },
                    orderPaymentRefund: {
                      data: paymentRefund.data,
                      loading: paymentRefund.loading,
                      mutate: variables => paymentRefund.mutate({ variables })
                    }
                  })
                }
              </OrderNoteAddProvider>
            )}
          </OrderCreateFulfillmentProvider>
        )}
      </OrderPaymentRefundProvider>
    )}
  </OrderPaymentCaptureProvider>
);
export default OrderOperations;
