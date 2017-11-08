import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import Captcha from '../components/Captcha';

function mapStateToProps(state) {
  return {
    captchas: state.captchas
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Captcha));
