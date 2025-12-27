import { OrderSummary, CustomerDetails } from '../types';

export const submitOrder = async (orderData: { 
  summary: OrderSummary; 
  customer: CustomerDetails;
  orderToken?: string;
  remarks?: string;
}) => {
  try {
    console.log('Submitting order via API route...');
    
    // Submit order via API route (server-side handles Firestore with admin privileges)
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: orderData.summary,
        customer: orderData.customer,
        orderToken: orderData.orderToken,
        remarks: orderData.remarks
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to submit order');
    }

    const result = await response.json();
    console.log('Order submitted successfully:', result);

    return {
      success: true,
      orderId: result.orderId,
      message: result.message
    };
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
};
