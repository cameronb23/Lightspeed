import { connect } from 'react-redux';
import Profiles from '../components/Profiles';

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

export default connect(mapStateToProps, mapDispatchToProps)(Profiles);
