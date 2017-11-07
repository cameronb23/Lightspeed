import { connect } from 'react-redux';
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskBuilder);
