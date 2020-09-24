import axios from "axios";
const BASEURL = 'http://31.31.199.37/api/group'

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
    groups: [],
    members: [],
    leader: '',
    leaderReduced: '',
    usersNoGroup: []
    // error: '',
    // error404: '',
  },
  getters: {
    groups: state => {
      return state.groups
    },
    leader: state => {
      return state.leader
    },
    leaderReduced: state => {
      return state.leaderReduced
    },
    members: state => {
      return state.members
    },
    usersNoGroup: (state, rootState) => {
      state.usersNoGroup = rootState.allUsers.filter(u => u.group_id == null)
      return state.usersNoGroup
    }
  },
  mutations: {
    setGroups: (state, payload) => {
      state.groups = Object.values(payload)
    },
    setLeader: (state, payload) => {
      state.leader = payload[0]
    },
    setLeaderReduced: (state, payload) => {
      payload[0].name = payload[0].name[0]+'.'
      payload[0].father_name ? payload[0].father_name = payload[0].father_name[0]+'.' : ' '
      state.leaderReduced = payload[0]
    },
    changeLeader: (state, payload) => {
      state.leaderReduced = state.members.filter(u => u.id == payload)[0]
    },
    setMembers: (state, payload) => {
      payload.length > 0 ? state.members = Object.values(payload) : state.members = []
    },

    addGroup: (state, payload) => {
      state.groups.push(payload)
      state.groups = state.groups.sort(function (a, b) {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1
      })
    },

    deleteGroup: (state, payload) => {
      state.groups = state.groups.filter(group => group.id !== payload)
    },
    editGroup: (state, payload) => {
      state.groups.find(group => group.id == payload.id).name = payload.name
      state.groups = state.groups.sort(function (a, b) {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1
      })
    },
    editGroupShort: (state, payload) => {
      state.groups.find(group => group.id == payload.id).short_name = payload.short_name
    },
    editExecutorGroup: (state, payload) => {
      state.groups.find(group => group.id == payload.id).leader_id = payload.leader_id
    },
    setUserToGroup: (state, payload) => {
      state.members.push(payload)
    },
    setRemoveUser: (state, payload) => {
      state.members = state.members.filter(m => m.id !== payload.uid)
    },
  },
  actions: {
    getGroups: async ({
      commit
    }) => {
      await axios.get(BASEURL)
        .then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('setGroups', response.data)
          }
        })
        .catch(error => {
          if (error.response.status == 401) {
            commit('setError404', error.response.data.errors)
          } else {
            commit('setError', error.response.data.message)
          }
        })
    },
    getLeader: async ({
      commit
    }, id) => {
      await axios.get(BASEURL + `/${id}/leader`)
        .then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('setLeader', response.data)
            commit('setLeaderReduced', response.data)
          }
        })
        .catch(error => {
          if (error.response.status == 401) {
            commit('setError404', error.response.data.errors)
          } else {
            commit('setError', error.response.data.message)
          }
        })
    },
    getMembers: async ({
      commit
    }, id) => {
      await axios.get(BASEURL + `/${id}/user`)
        .then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('setMembers', response.data)
          }
        })
        .catch(error => {
          if (error.response.status == 401) {
            commit('setError404', error.response.data.errors)
          } else {
            commit('setError', error.response.data.message)
          }
        })
    },


    postGroup: async ({
      commit
    }, param) => {
      param.short_name == '' ? delete param.short_name : param.short_name
      return new Promise((resolve, reject) => {
        axios.post(BASEURL, param)
          .then(response => {
            commit('setError', '')
            commit('setError404', '')
            commit('addGroup', response.data)
            resolve(response.data)
          })
          .catch(error => {
            if (error.response.status !== 422) {
              error.response.data.message ? commit('setError404', error.response.data.message) : commit('setError404', error.response.data.errors)
              reject(error.response)
            } else {
              error.response.data.errors ? commit('setError', error.response.data.errors) : commit('setError', error.response.data.error)
              reject(error.response.data)
            }

          })
      })

    },
    deleteGroup: async ({
      commit
    }, param) => {
      // param.id = 10000000
      return new Promise((resolve, reject) => {
     axios.delete(BASEURL + `/${param.id}`).then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('deleteGroup', param.id)
            resolve(response.data)
          }
        })
        .catch(error => {
          if (error.response.status !== 422) {
            commit('setError404', error.response.data.message)
            reject(error.response.data.message)
          } else {
            commit('setError', error.response.data.errors.name[0])
            reject(error.response.data.errors.name[0])
          }
        })
      })

    },
    // checkIfExists: async ({
    //   commit
    // }, param) => {
    //   axios.get(BASEURL + `/${param.id}`).catch((error) => {
    //     commit('setError404', error.response.data.message)
    //   })
    // },

    editGroup: async ({
      commit
    }, param) => {
      return new Promise((resolve, reject) => {
        axios.put(BASEURL + `/${param.id}`, {
          name: param.name
        }).then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('editGroup', response.data)
            resolve(response)
          }
        }).catch((error) => {
          if (error.response.status !== 422) {
            commit('setError404', error.response.data.message)
            reject(error.response.data.message)
          } else {
            commit('setError404', error.response.data.errors.name[0])
            reject(error.response.data.errors.name[0])
          }
        })
      })
    },

    editGroupShort: async ({
      commit
    }, param) => {
      return new Promise((resolve, reject) => {
        axios.put(BASEURL + `/${param.id}/change-short-name`, {
          short_name: param.short_name
        }).then(response => {
          if (response.status == 200) {
            commit('setError', '')
            commit('setError404', '')
            commit('editGroup', response.data)
            resolve(response)
          }
        }).catch((error) => {
          if (error.response.status !== 422) {
            commit('setError404', error.response.data.message)
            reject(error.response.data.message)
          } else {
            commit('setError404', error.response.data.errors.short_name[0])
            reject(error.response.data.errors.short_name[0])
          }
        })
      })
    },

    // checkIfOk: async ({
    //   state,
    //   commit
    // }, param) => {
    //   // param.id = 10000000000
    //   return new Promise((resolve, reject) => {
    //     if (state.groups.filter(t => t.description == param.description).length > 1 && state.tasks.filter(t => t.leader_id == param.leader_id).length > 1) {
    //       commit('setError404', 'Такая задача уже существует с таким ответственным')
    //       reject('false')

    //     } else {
    //       resolve('true')
    //     }
    //   })
    // },
    changeExecutorGroup: async ({
      commit
    }, param) => {
      // param.id = 10000000000
      return new Promise((resolve, reject) => {
      axios.put(BASEURL + `/${param.id}/change-leader/${param.uid}`).then(response => {
        commit('setError', '')
        commit('editExecutorGroup', response.data)
        resolve(response.data)
      }).catch((error) => {
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
          reject( error.response)
        } else if (error.response.status == 422) {
          if (error.response.data.errors.leader_id) {
            commit('setError404', error.response.data.errors.leader_id[0])
            reject( error.response)
          } else {
            commit('setError404', error.response.data.errors)
            reject( error.response)
          }
        }
      })
    })
    },
    putUserToGroup: async ({
      commit
    }, param) => {
      // param.uid = 10000000000
      axios.put(BASEURL + `/${param.id}/user/${param.uid}`).then(response => {
        commit('setError', '')
        commit('setUserToGroup', response.data)
      }).catch((error) => {
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
        } else if (error.response.status == 422) {
          if (error.response.data.errors.leader_id) {
            commit('setError404', error.response.data.errors.leader_id[0])
          } else {
            commit('setError404', error.response.data.errors)
          }
        }
      })
    },
    removeUserFromGroup: async ({
      commit
    }, param) => {
      // param.uid = 10000000000
      axios.put(BASEURL + `/${param.id}/remove-user/${param.uid}`).then(() => {
        commit('setError', '')
        commit('setRemoveUser', param)
      }).catch((error) => {
        if (error.response.status == 404) {
          commit('setError404', error.response.data.message)
        } else if (error.response.status == 422) {
          if (error.response.data.errors.leader_id) {
            commit('setError404', error.response.data.errors.leader_id[0])
          } else {
            commit('setError404', error.response.data.errors)
          }
        }
      })
    },
  }
}