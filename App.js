// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React , { useState, useEffect, useCallback } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, Text, TextInput, View, YellowBox, Button, Image} from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore'
import logo from './assets/QUARelation-logo.png';
import otherLogo from './assets/Quarelation-vector.png';


const firebaseConfig = {
  apiKey: "AIzaSyCdrm2Y0wvrXK7YY2vW4daP9rqIdvYDxPM",
  authDomain: "quarelation.firebaseapp.com",
  databaseURL: "https://quarelation.firebaseio.com",
  projectId: "quarelation",
  storageBucket: "quarelation.appspot.com",
  messagingSenderId: "802775553827",
  appId: "1:802775553827:web:4d0c15709cc08559a7de96"
}

if(firebase.apps.length == 0){
  firebase.initializeApp(firebaseConfig)
}

YellowBox.ignoreWarnings(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
          .docChanges()
          .filter(({ type }) => type == 'added')
          .map(({ doc }) => {
              const message = doc.data()
              return { ...message, createdAt: message.createdAt.toDate() }
           })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)   
    })
     return() => unsubscribe () 
  }, [])
  
  const appendMessages = useCallback (
    (messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages) )
  }, 
  [messages]
  )

  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
    }
  }
  async function HandlePress(){
      const _id = Math.random().toString(36).substring(7)
      const user = {_id, name}
      await AsyncStorage.setItem('user',JSON.stringify(user))
      setUser(user)
  }
  async function handleSend(messages) {
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
    }

  if (!user){
    return (
       <View style={styles.container}>
            <Image style={styles.logod} source={require('./assets/Quarelation-vector.png')} /> 
        <Image style={styles.logo} source={require('./assets/QUARelation-logo.png')}/>
            <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName}  />
            <Button  onPress={HandlePress} title="Enter the chat" />
        
        </View>
    )
  }
 return <GiftedChat messages={messages} user={user}  onSend={handleSend}/>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  logod:{
    height: 100,
    width: 160,
    position: 'absolute',
    top: 100,
  },
  
  logo:{
    height: 100,
    width: 160,
    position: 'absolute',
    top: 200,
  },

  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
  }

})
