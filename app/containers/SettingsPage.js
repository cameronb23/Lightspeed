import { connect } from 'react-redux';
import Settings from '../components/settings/Settings';

function mapStateToProps(state) {
  return {
    app: state.app
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
