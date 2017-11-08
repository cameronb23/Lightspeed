import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import TaskBuilder from '../components/taskbuilder/TaskBuilder';

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TaskBuilder));
