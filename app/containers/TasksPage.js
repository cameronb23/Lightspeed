import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import Tasks from '../components/Tasks';

function mapStateToProps(state) {
  return {
    tasks: state.tasks
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Tasks));
