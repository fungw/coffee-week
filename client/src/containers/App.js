import React, { Component } from 'react';
import CardList from '../components/CardList';
import Header from '../components/Header';
import Toolbar from '../components/Toolbar';
import Scroll from '../components/Scroll';
import './App.sass';

class App extends Component {

  constructor() {
    super();
    this.SHOWALL = 'SHOW-ALL';
    this.SHOWCOFFEE = 'SHOW-COFFEE';
    this.state = {
      filter: { 
        department: {
          engineering: true, 
          humanResources: false
        },
        location: {
          dub: true,
          ny: true 
        }
      },
      response: '',
      searchField: '',
      showFilter: this.SHOWCOFFEE,
      weekDate: ''
    }
  }

  componentDidMount() {
    this.fetchCoffeeList()
      .then(res => this.setState({ response: res.coffeeUserList }))
      .catch(err => console.log(err));
    this.fetchWeekDate()
      .then(res => this.setState({ weekDate: res.weekDate }))
      .catch(err => console.log(err));
  }

  fetchAllUsers = async () => {
    const response = await fetch('/api/fetchAllUsers');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  fetchCoffeeList = async () => {
    const response = await fetch('/api/fetchCoffeeList');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  fetchWeekDate = async () => {
    const response = await fetch('/api/fetchWeekDate');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  filterSearchAllUsers = () => {
    const { searchField, response } = this.state;
    let searchQuery = searchField.split(':');

    return response.filter(user => {
      if (searchQuery.length === 2) {
        return (user[searchQuery[0]].toLowerCase().includes(searchQuery[1].toLowerCase()));
      } else {
        return (user.name.first.toLowerCase().includes(searchField.toLowerCase())) 
          || (user.name.last.toLowerCase().includes(searchField.toLowerCase()));
      }
    });
  }

  filterSearchUser = () => {
    const { searchField, response } = this.state;
    let filteredUsers = [];
    let searchQuery = searchField.split(':');
    let userPair;
    for (let i=0; i<response.length; i++) {
      userPair = response[i].filter(user => {
        if (searchQuery.length === 2) {
          return (user[searchQuery[0]].toLowerCase().includes(searchQuery[1].toLowerCase()));
        } else {
          return (user.name.first.toLowerCase().includes(searchField.toLowerCase())) 
            || (user.name.last.toLowerCase().includes(searchField.toLowerCase()));
        }
      });
      if (userPair.length !== 0) {
        filteredUsers.push(response[i]);
      }
    }
    return filteredUsers;
  }

  filterShowOptions = (userList) => {
    const { filter } = this.state;
    let filteredUsers = [];
    let userMatch;

    for (let optionsCategory in filter) {
      for (let option in filter[optionsCategory]) {
        if (filter[optionsCategory][option]) {
          for (let i=0; i<userList.length; i++) {
            userMatch = userList[i].filter(user => {
              return (user[optionsCategory] === option);
            });
            if ((userMatch.length !== 0) && (!filteredUsers.includes(userList[i]))) {
              filteredUsers.push(userList[i]);
            }
          }
        }
      }
    }
    return filteredUsers;
  }

  filterShowOptionsAllUsers = (userList) => {
    const { filter } = this.state;
    let filteredUsers = [];
    let userMatch;

    for (let optionsCategory in filter) {
      for (let option in filter[optionsCategory]) {
        if (filter[optionsCategory][option]) {
          userMatch = userList.filter(user => {
            if (option === 'humanResources') {
              return user[optionsCategory] === 'human resources';
            } else {
              return (user[optionsCategory] === option);
            }
          });
          for (let i=0; i<userMatch.length; i++) {
            if (!filteredUsers.includes(userList[i])) {
              filteredUsers.push(userMatch[i]);
            }
          }
        }
      }
    }
    return filteredUsers;
  }

  onCheckboxChange = (event) => {
    var checkboxValue = event.target.value.split('.');
    let filterItems = {...this.state.filter};
    filterItems[checkboxValue[0]][checkboxValue[1]] = event.target.checked;
    this.setState({ filter: filterItems });
  }
  
  onRadioChange = async (event) => {
    if ((event.target.value).toUpperCase() === this.SHOWALL) {
      this.fetchAllUsers()
        .then(res => this.setState({ response: res.allUsers, showFilter: this.SHOWALL, 
          filter: { 
            department: {
              engineering: true, 
              humanResources: true
            },
            location: {
              dub: true,
              ny: true 
            }
          }
        })).catch(err => console.log(err));
    } else if ((event.target.value).toUpperCase() === this.SHOWCOFFEE) {
      this.fetchCoffeeList()
        .then(res => this.setState({ response: res.coffeeUserList, showFilter: this.SHOWCOFFEE,
          filter: { 
            department: {
              engineering: true, 
              humanResources: false
            },
            location: {
              dub: true,
              ny: true 
            }
          } 
        })).catch(err => console.log(err));
    }
  }
  
  onSearchChange = (event) => {
    this.setState({ searchField: event.target.value });
  }

  render() {
    const { filter, response, showFilter, weekDate } = this.state;
    let filteredUsers;

    if (showFilter === this.SHOWCOFFEE) {
      filteredUsers = this.filterSearchUser();
      filteredUsers = this.filterShowOptions(filteredUsers);
    } else {
      filteredUsers = this.filterSearchAllUsers();
      filteredUsers = this.filterShowOptionsAllUsers(filteredUsers);
    }

    return (!response.length ? 
      <h1>Loading</h1>
      :
      <div className='tc'>
        <Header weekDate={weekDate}></Header>
        <Toolbar searchChange={this.onSearchChange} checkboxChange={this.onCheckboxChange} radioChange={this.onRadioChange} filter={filter}/>
        <Scroll>
          <CardList hbcUsers={filteredUsers} showFilter={showFilter}></CardList>
        </Scroll>
      </div>
    )
  }
}

export default App;