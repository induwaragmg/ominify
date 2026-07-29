import { auth } from "@clerk/nextjs/server";

const TestPage = async (): Promise<React.ReactNode> => {
    const { getToken } = await auth();
    const token = await getToken();
    console.log(token); 

    const resProduct = await fetch("http://localhost:8000/test", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const dataProduct = await resProduct.json();
    console.log("Client received response:", dataProduct);

    const resOrder = await fetch("http://localhost:8001/test", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const dataOrder = await resOrder.json();
    console.log("Client received response:", dataOrder);
    
    const resPayment = await fetch("http://localhost:8002/test", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const dataPayment = await resPayment.json();
    console.log("Client received response:", dataPayment);

    // console.log("token:", token);
  return (
    <div className=''>TestPage</div>
  )
}

export default TestPage