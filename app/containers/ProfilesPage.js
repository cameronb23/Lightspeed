import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import Profiles from '../components/profile/Profiles';

function mapStateToProps(state) {
  return {
    profiles: state.profiles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Profiles));
