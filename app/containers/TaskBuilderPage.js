import { connect } from 'react-redux';
import TaskBuilder from '../components/TaskBuilder';

function mapStateToProps(state) {
  return {
    tasks: state.tasks,
    profiles: state.profiles
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskBuilder);
