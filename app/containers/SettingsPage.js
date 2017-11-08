import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
