import axios from "axios";
const BASEURL = 'http://31.31.199.37/api/solution' //все решения
const URLTASK = 'http://31.31.199.37/api/task' //одно решение


// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Accept'] = 'application/json'
axios.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${ token }`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  })

export default {
  state: {
    tasks: [],
    currentSolution: '',
    token: localStorage.getItem('user-token') || '',
  },
  getters: {
    tasks: state => {
      return state.tasks 
    },
    currentSolution: state => {
      return state.currentSolution 
    },

  },
  mutations: {
    setTasks: (state, payload) => {
      state.tasks = payload
    },
    setCurrentSolution: (state, payload) => {
      state.currentSolution = payload
    },
    clearTasks: (state) => {
      state.tasks = null
    },
    addTask: (state, payload) => {
      console.log(payload);
      state.tasks.push(payload)
    },
    deleteTask: (state, payload) => {
      state.tasks = state.tasks.filter(t => t.id !== payload)
    },
    // sortTasks: state => {
    //   state.tasks = state.tasks.sort(function (a, b) {
    //     return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1
    //   })
    // },

    editTask: (state, {id, description}) => {
      state.tasks.find(task => task.id == id).description = description
      console.log(state.tasks);
    },
    editinWorkTask: (state, payload) => {
      if (payload.in_work) {
        state.tasks.push(payload)
      } else {
        state.tasks = state.tasks.filter(s=> s.id !== payload.id)
      }
    },
    editStatusTask: (state, payload) => {
      state.tasks.find(task => task.id == payload.id).status = payload.status
    },
    editDeadlineTask: (state, payload) => {
      state.tasks.find(task => task.id == payload.id).deadline = payload.deadline
      console.log(state.tasks);
    },
    editExecutorTask: (state, payload) => {
      state.tasks.find(task => task.id == payload.id).executor_id = payload.executor_id
      console.log(state.tasks);
    },

  },
  actions: {
    clearTasks: async ({commit}) => {
      commit('clearTasks')
    },
    getCurrentSolution: async ({commit}, param) => {
      commit('setCurrentSolution', param)
    },
    getTasks: async ({
      commit
    }, param) => {
      await axios.get(BASEURL + `/${param}/task`)
        .then(response => {
          console.log(response);
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('setTasks', response.data)
          }
        })
        .catch(error =>
          commit('setError', error.response.data.errors)
        )
    },
    postTask: async ({commit}, param) => {
      // param.solutionId = 100000000
      console.log(param);
      await axios.post(BASEURL + `/${param.solutionId}/task`, {
        description: param.description
        })
        .then(response => {
          if (response.status == 201) {
            commit('setError', '')
            commit('setError404', '')
            commit('addTask', response.data)
          }
        })
        .catch(error => {
          console.log(error.response);
          commit('setError404', '')
          if (error.response.status == 422) {
            if (error.response.data.errors.description) {
              commit('setError', error.response.data.errors.description[0])
            } else if (!error.response.data.errors.description) {
              commit('setError404', error.response.data.errors)
            } 
          } else {
            commit('setError404', error.response.data.message)
          }
          
        })
    },

    deleteTask: async ({commit}, id) => {
      id = 10000000000
      await axios.delete(URLTASK + `/${id}`).then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('deleteTask', id)
          }
        })
        .catch(error => {
          commit('setError404', error.response.data.message)
        })
    },

    editTask: async ({commit}, param) => {
      // param.id = 10000000000
      console.log(param);
      return new Promise((resolve, reject) => {
        axios.put(URLTASK + `/${param.id}`, {
          description: param.description
        }).then(response => {
          console.log(response);
          // if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('editTask', response.data)
            // commit('sortSolutions')
            resolve(response)
          // }
        }).catch((error) => {
          // commit('setError404', '')
          console.log(error.response);
          if (error.response.status == 422) {
            commit('setError404', '')
            commit('setError404', error.response.data.errors.name[0])
            // return param.id
            reject(error.response.data.message)
          } else {
            commit('setError404', '')
            commit('setError404', error.response.data.message)
            // return param.id
            reject(error.response.data.message)
          }
          // reject(error.response.data.message)
        })
      })
    },
    // changeinWorkTask: async ({commit}, param) => {
    //   // param.id = 10000000000
    //   console.log(param);
    //   axios.put(BASEURL + `/${param.id}/change-in-work`, {
    //     in_work: param.in_work
    //   }).then(response => {
    //       commit('setError', '')
    //       commit('editinWorkTask', response.data)
    //       // commit('sortSolutions')
    //   }).catch((error) => {
    //     if (error.response.status == 404) {
    //       commit('setError404', error.response.data.message)
    //     }
    //     else if (error.response.status == 422) {
    //       commit('setError404', error.response.data.errors)
    //     }
    //   })
    // },

    changeStatusTask: async ({commit}, param) => {
      // param.id = 10000000000
      console.log(param);
      axios.put(URLTASK + `/${param.id}/change-status`, {
        status: param.status
      }).then(response => {
        console.log(response);
          commit('setError', '')
          commit('editStatusTask', response.data)
      }).catch((error) => {
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
        }
        else if (error.response.status == 422) {
          commit('setError404', error.response.data.errors)
        }
      })
    },

    changeDeadlineTask: async ({commit}, param) => {
      // param.id = 10000000000
      console.log(param);
      axios.put(URLTASK + `/${param.id}/set-deadline`, {
        deadline: param.deadline
      }).then(response => {
        console.log(response);
          commit('setError', '')
          commit('editDeadlineTask', response.data)
      }).catch((error) => {
        console.log(error.response);
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
        }
        else if (error.response.status == 422) {
          commit('setError404', error.response.data.errors)
        }
      })
    },

    changeExecutorTask: async ({commit}, param) => {
      // param.id = 10000000000
      console.log(param);
      axios.put(URLTASK + `/${param.id}/set-executor`, {
        executor_id: param.uid
      }).then(response => {
        console.log(response);
          commit('setError', '')
          commit('editExecutorTask', response.data)
      }).catch((error) => {
        console.log(error.response);
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
        }
        else if (error.response.status == 422) {
          commit('setError404', error.response.data.errors.executor)
        }
      })
    },
  }
}