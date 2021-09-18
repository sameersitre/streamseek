import { createMuiTheme } from '@material-ui/core/styles';
const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});
export default theme;