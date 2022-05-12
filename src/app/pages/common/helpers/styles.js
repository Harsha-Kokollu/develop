import { getTheme, mergeStyleSets } from "@fluentui/react"

const theme=getTheme(true);
export const modalStyles=mergeStyleSets({
  container:{
		display:'flex',
	},
  header:[
    {
      backgroundColor:theme.palette.themePrimary,
      padding:'15px',
      color:theme.palette.white,
      display:"flex",
      justifyContent:"space-between",
      fontWeight:"800 !important",
      fontSize:'18px',
      flex: `1 1 auto`,
      zIndex:"1000",
      position: `sticky !important`,
      top: `0px !important`,
      marginTop:'0px',
      i:{
        color:theme.palette.white,

      }
      


    }
  ],
  body:{
    width:"92vw",
    height:"90vh",
    overflow:"auto",
  },
  content:{
padding:'20px',
borderTop:`1px solid ${theme.palette.neutralQuaternaryAlt}`,

  },
  modalContentLabel:{
    color:theme.palette.themePrimary,
    marginBottom:"10px",fontWeight:'600',fontSize:'16px'},
  item:{
    backgroundColor:"#F5F5F5",
    borderLeft:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    borderRight:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    borderBottom:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    fontWeight:"600"
  },
  modalContent:{
    border:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    paddingLeft:'7px !important',
    paddingRight:'7px !important',
  },
  footerRowContent:{
    borderLeft:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    borderRight:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
      borderTop:`1px solid ${theme.palette.neutralQuaternaryAlt}`,
    backgroundColor:"#F5F5F5",
  },
  footerColumn:{
    //marginLeft:'5px'
    paddingLeft:'5px'
  },
  mainRowContent:{
    minHeight:'50px !important'
  },


}) 