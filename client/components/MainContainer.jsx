import React, { useState, useEffect } from "react";
import Profile from './Profile.jsx';
import Chatroom from './Chatroom.jsx';
import EventsFeed from './EventsFeed.jsx';
import Notnav from './Navbar.jsx';
import axios from 'axios';
import { Card, Button, Col, Row, Container } from 'react-bootstrap';
import AddSearchEvent from './AddSearchEvent.jsx';

export default function MainContainer() {
  // const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState(""); // email?
  const [user, setUser] = useState({}); // actual name of user
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("");
  const [dummyData, setDummyData] = useState([
    {
      senderId: "take out trash",
      text: "feed the dogs"
    },
    {
      senderId: "fix back patio door",
      text: "water the plants, all 144"
    },
    {
      senderId: "fix back patio door",
      text: "get haircut"
    },
    {
      senderId: "fix back patio door",
      text: "catch up on correspondence"
    },
  ]);

  useEffect(() => {
    axios.get(`/api/info?userName=${userName}`) // currently query is not in use (save for when we can visit other ppl's pages)
      .then((res) => {
        console.log('get request in mainContainer.jsx, res data: ', res.data);
        let userInfo = {
          userid: res.data.users.userid,
          username: res.data.users.username,
          firstname: res.data.users.firstname,
          lastname: res.data.users.lastname,
          profilephoto: res.data.users.profilephoto,
        }
        let eventsInfo = res.data.events; // content: already included in eventsInfo
        setUser(userInfo);
        setEvents(eventsInfo);
        setUserName(res.data.users.username);
        setStatus('loggedIn');
      })
  }, []);



  function handleUserPageChange(username) {
    console.log('username:', username)
    setUserName(username);
  }

  function handleCreateEvent(event) {
    let { eventtitle, eventlocation, eventdate, eventstarttime, eventdetails, eventtype } = event;
    console.log('MainContainer.jsx eventtitle: ', eventtitle)
    console.log('MainContainer.jsx eventlocation OR INGREDIENT: ', eventlocation)
    console.log('MainContainer.jsx eventtype: ', eventtype)
    console.log('MainContainer.jsx eventdate: ', eventdate)
    console.log('MainContainer.jsx eventstarttime: ', eventstarttime)
    console.log('MainContainer.jsx eventdetails: ', eventdetails)
    axios.post(`/api/create?userName=${userName}`, { eventtitle, eventlocation, eventdate, eventstarttime, eventdetails, eventtype })
      .then((res) => {
        console.log(res.data);
        // let userInfo = {
        //   userName: res.data.users.username,
        //   firstName: res.data.users.firstname,
        //   lastName: res.data.users.lastname,
        //   profilePicture: res.data.users.profilephoto,
        // }
        // let eventsInfo = res.data.events;
        // setUser(userInfo);
        // setEvents(eventsInfo);
      })
    event.attendees = [{
      username: user.username,
      profilephoto: user.profilephoto
    }];
    const newEvents = [event].concat(events);
    console.log("updated events:", newEvents);
    setEvents(newEvents);
  }

  function handleCreateMessage(content) { // bubble this down to Content.jsx
    let { userid, username } = user;
    console.log('=======> handleCreateMessage userid: ', userid)
    console.log('=======> handleCreateMessage userid: ', username)
    let { eventid, eventtitle, messagetext, messagedate, messagetime } = content;
    axios.post(`/api/message?eventtitle=${eventtitle}`, { userid, username, eventid, messagetext, messagedate, messagetime })
      .then((res) => {
        console.log(res.data);
        // let userInfo = {
        //   userName: res.data.users.username,
        //   firstName: res.data.users.firstname,
        //   lastName: res.data.users.lastname,
        //   profilePicture: res.data.users.profilephoto,
        // }
        // let eventsInfo = res.data.events;
        // setUser(userInfo);
        // setEvents(eventsInfo);
      })
    event.content = [{
      username: user.username,
      profilephoto: user.profilephoto,
      messagetext: messagetext,
      messagedate: messagedate,
      messagetime: messagetime,
    }];
    // const newEvents = [event].concat(events);
    // console.log("updated event with messages:", newEvents);
    // setEvents(newEvents);
    window.location.reload(true);
  }

  function handleSearchEvent(event) {
    console.log("Main Container:", event)
    // ADD
    axios.post(`/api/add?eventtitle=${event.eventtitle}`)
      .then((res) => {
        console.log(res.data);
        event.attendees.push(
          {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            profilephoto: user.profilephoto
          });
        if (!events.content) event.content = [];
        else {
          event.content.push({
            username: events.content.username,
            profilephoto: events.content.profilephoto,
            text: events.content.messagetext,
            time: events.content.messagetime,
          });
        };
        const newEvents = [event].concat(events);
        console.log("updated events:", newEvents);
        setEvents(newEvents);
      })
    // END ADD
    // event.attendees.push(
    //   {
    //     username: user.username,
    //     profilephoto: user.profilephoto
    //   });
    // const newEvents = [event].concat(events);
    // console.log("updated events:", newEvents);
    // setEvents(newEvents);
  }

  return (
    <div className="myContainer">
      <div className="topnav">
        <Notnav className="notnav" status={status} />
      </div>
      <div className="columncontainer">
        <div className="col1">
          <Profile {...user} />
          <AddSearchEvent addEvent={handleCreateEvent} searchEvent={handleSearchEvent} events={events} />
          <Card.Body className="users">
            <Card.Title>
              <h4 id="usersTitle">Scratch Pad</h4>
              <Chatroom messages={dummyData} />
            </Card.Title>
            <Card.Text>
              <div className="showusers">

              </div>
            </Card.Text>
          </Card.Body>
        </div>
        <div className="col2">
          <EventsFeed
            setEvents={setEvents}
            handleCreateMessage={handleCreateMessage}
            events={events}
            userUpdate={handleUserPageChange}
          />
        </div>
      </div>
    </div>
  );
}