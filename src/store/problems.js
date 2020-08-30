import axios from "axios";
// const baseURL = "http://localhost:3000/problems" 
const BASEURL = 'http://31.31.199.37/api/problem'

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Accept'] = 'application/json'

export default {
  state: {
    problems: [],
    error: '',
    error404: ''
  },
  getters: {
    problems: state => {
      // state.problems.sort(function (a, b) {
      //     return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1})
      return state.problems = state.problems.sort(function (a, b) {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1})
    },
    error: state => {
      return state.error
    },
    error404: state => {
      console.log(state.error404);
      return state.error404
    }
  },
  mutations: {
    setProblems: (state, payload) => {
      state.problems = payload
    },
    addProblem: (state, payload) => {
      console.log('addProblem', payload);
        state.problems.push(payload)
    },
    deleteProblem: (state, payload) => {
        state.problems = state.problems.filter(problem => problem.id !== payload)
    },
    editProblem: (state, payload) => {
        state.problems.find(problem => problem.id == payload.id).name = payload.name
    },
    setError: (state, payload) => {
      state.error = payload
    },
    setError404: (state, payload) => {
      state.error404 = payload
    },
    
  },
  actions: {
    getProblems: async ({commit}) => {
      await axios.get(BASEURL)
        .then(response => {
            if (response.status == 200) {
              commit('setError', '')
              commit('setProblems', response.data) 
            }
          })
        .catch(error => 
          commit('setError', error.response.data.message)
        )
    },
    postProblem: async ({commit}, param) => {
      await axios.post(BASEURL, param)
      .then(response => {
        if (response.status == 201) {
          commit('setError', '')
          commit('addProblem', response.data)
        }
        })
      .catch(error => commit('setError', error.response.data.errors.name[0]))

    }, 
    deleteProblem: async ({commit}, param) => {
      await axios.delete(BASEURL + `/${param.id}`).then(response => {
        if (response.status == 200) { 
          commit('setError', '')
          commit('deleteProblem', param.id)
        }
        })
      .catch(error => commit('setError', error.response.data.errors.name[0]))
    },
    checkIfExists: async ({commit}, param) => {
      axios.get(BASEURL + `/${param.id}`).catch((error) => {
        console.log(error.response);
        commit('setError404', error.response.data.message)})
    },

    editProblem: async ({commit}, param) => {
        axios.put(BASEURL + `/${param.id}`, {name: param.name}).then(response => {
        if (response.status == 200) { 
            commit('setError', '')
            commit('editProblem', response.data)
        }
      }).catch((error) => {
        console.log(error.response);
        commit('setError', error.response.data.errors.name[0])})
    }
  }
}