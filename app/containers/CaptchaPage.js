import { connect } from 'react-redux';
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

export default connect(mapStateToProps, mapDispatchToProps)(Captcha);
