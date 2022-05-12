import { Dialog, Spinner, SpinnerSize } from "@fluentui/react"

 const PageOverlayLoader=({hidden,label,className,labelPosition})=>{
    
    return(<>
    <Dialog className={`oc-page-overlay ${className}`} hidden={hidden} >
      <div className="m-t-20">
      <Spinner size={SpinnerSize.large} labelPosition={labelPosition}  label={label}/>
      </div>
    </Dialog>
    </>)
  }

  export default PageOverlayLoader;