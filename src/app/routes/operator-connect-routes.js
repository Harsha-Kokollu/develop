import Home from "../pages/common/components/home";
import ProductView from "../pages/products/components/product-view";
import { OperatorConnectURLProps } from "../pages/common/settings/operator-connect-urls";
import Quote from "../pages/quotes/components/quote";
import QuoteOrders from "../pages/quotes/components/quote-order";


const OperatorConnectRoutes=[
    {
        component:Home,
        url:OperatorConnectURLProps.index
    },
    {
        component:ProductView,
        url:OperatorConnectURLProps.productManagement.productView
    },
    {
        component:Quote,
        url:OperatorConnectURLProps.orderManagement.quoteAdd
    },
    {
        component:Quote,
        url:OperatorConnectURLProps.orderManagement.quoteUpdate
    },
    {
        component: QuoteOrders,
        url: OperatorConnectURLProps.orderManagement.quoteOrders,
      }
    
]

export default OperatorConnectRoutes;