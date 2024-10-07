// import React, { useState, useEffect } from 'react'
// import { 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   Divider, 
//   Box, 
//   TextField, 
//   Button,
//   Paper
// } from '@mui/material'
// import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
// import { db } from '../services/firebase'
// import { getAuth } from 'firebase/auth'

// export default function JobChat() {
//   const [jobs, setJobs] = useState([])
//   const [selectedJob, setSelectedJob] = useState(null)
//   const [applicants, setApplicants] = useState([])
//   const [selectedApplicant, setSelectedApplicant] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState('')
//   const currentUser = getAuth().currentUser

//   useEffect(() => {
//     if (!currentUser) return

//     // שליפת העבודות שפורסמו על ידי המשתמש הנוכחי
//     const q = query(collection(db, 'jobs'), where('postedBy', '==', currentUser.uid))
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//       setJobs(jobList)
//     })

//     return () => unsubscribe()
//   }, [currentUser])

//   // בחירת עבודה להצגת המועמדים שלה
//   const handleJobClick = (jobId) => {
//     setSelectedJob(jobId)
//     setSelectedApplicant(null)

//     // שליפת המועמדים לעבודה הנבחרת
//     const q = query(collection(db, 'jobChats', jobId, 'applicants'))
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const applicantsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//       setApplicants(applicantsList)
//     })

//     return () => unsubscribe()
//   }

//   // בחירת מועמד להצגת השיחה עמו
//   const handleApplicantClick = (applicantId) => {
//     setSelectedApplicant(applicantId)

//     // שליפת ההודעות עם המועמד הנבחר
//     const q = query(
//       collection(db, 'jobChats', selectedJob, 'applicants', applicantId, 'messages'),
//       orderBy('timestamp')
//     )
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const messageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//       setMessages(messageList)
//     })

//     return () => unsubscribe()
//   }

//   // שליחת הודעה למועמד
//   const handleSendMessage = async () => {
//     if (newMessage.trim() === '') return

//     await addDoc(collection(db, 'jobChats', selectedJob, 'applicants', selectedApplicant, 'messages'), {
//       text: newMessage,
//       senderId: currentUser.uid, // מזהה השולח
//       receiverId: selectedApplicant, // מזהה המקבל
//       timestamp: serverTimestamp()
//     })

//     setNewMessage('')
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         צ'אט עבודות
//       </Typography>
//       <Paper elevation={3} sx={{ p: 2, display: 'flex', height: 'calc(100vh - 200px)' }}>
//         {/* צד שמאל - רשימת העבודות */}
//         <Box sx={{ width: '30%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
//           {!selectedJob ? (
//             <>
//               <Typography variant="h6" gutterBottom>
//                 העבודות שלי
//               </Typography>
//               <List>
//                 {jobs.map((job) => (
//                   <ListItem button key={job.id} onClick={() => handleJobClick(job.id)}>
//                     <ListItemText primary={job.title} secondary={job.company} />
//                   </ListItem>
//                 ))}
//               </List>
//             </>
//           ) : (
//             <>
//               <Typography variant="h6" gutterBottom>
//                 מועמדים לעבודה
//               </Typography>
//               <List>
//                 {applicants.map((applicant) => (
//                   <ListItem button key={applicant.id} onClick={() => handleApplicantClick(applicant.id)}>
//                     <ListItemText primary={`מועמד: ${applicant.id}`} />
//                   </ListItem>
//                 ))}
//               </List>
//               <Button onClick={() => setSelectedJob(null)}>חזרה לרשימת העבודות</Button>
//             </>
//           )}
//         </Box>

//         {/* צד ימין - השיחה עם המועמד הנבחר */}
//         <Box sx={{ width: '70%', pl: 2 }}>
//           {selectedApplicant ? (
//             <>
//               <Typography variant="h6" gutterBottom>
//                 שיחה עם מועמד {selectedApplicant}
//               </Typography>
//               <Box sx={{ height: 'calc(100% - 100px)', overflowY: 'auto', mb: 2 }}>
//                 {messages.map((message) => (
//                   <Box key={message.id} sx={{ mb: 1, textAlign: message.senderId === currentUser.uid ? 'right' : 'left' }}>
//                     <Typography variant="body2" sx={{ backgroundColor: message.senderId === currentUser.uid ? '#e3f2fd' : '#f5f5f5', p: 1, borderRadius: 1, display: 'inline-block' }}>
//                       {message.text}
//                     </Typography>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       {message.timestamp?.toDate().toLocaleString()}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Box>
//               <Divider />
//               <Box sx={{ mt: 2, display: 'flex' }}>
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   size="small"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="הקלד הודעה..."
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       handleSendMessage()
//                     }
//                   }}
//                 />
//                 <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
//                   שלח
//                 </Button>
//               </Box>
//             </>
//           ) : (
//             <Typography variant="body1" sx={{ textAlign: 'center', mt: 10 }}>
//               בחר עבודה ומועמד כדי להתחיל שיחה
//             </Typography>
//           )}
//         </Box>
//       </Paper>
//     </Box>
//   )
// }








// import React, { useState, useEffect, useContext } from 'react'
// import { 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   Divider, 
//   Box, 
//   TextField, 
//   Button,
//   Paper
// } from '@mui/material'
// import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'
// import { db } from '../services/firebase'
// import { getAuth } from 'firebase/auth'
// import { AuthContext } from '../contexts/AuthContext'

// export default function JobChat() {
//   const { user } = useContext(AuthContext)
//   const [chats, setChats] = useState([])
//   const [selectedChat, setSelectedChat] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState('')
//   const currentUser = getAuth().currentUser

//   useEffect(() => {
//     if (!currentUser) return

//     // שליפת הצ'אטים לפי תפקיד המשתמש
//     const chatsQuery = query(
//       collection(db, 'jobChats'),
//       where(user.isEmployer ? 'employerId' : 'applicantId', '==', currentUser.uid) // לפי תפקיד
//     )
//     const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
//       const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//       setChats(chatList)
//     })

//     return () => unsubscribe()
//   }, [currentUser, user.isEmployer])

//   // בחירת צ'אט להצגת ההודעות
//   const handleChatClick = (chat) => {
//     setSelectedChat(chat)

//     const messagesQuery = query(
//       collection(db, 'jobChats', chat.id, 'messages'),
//       orderBy('timestamp')
//     )
//     const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
//       const messageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//       setMessages(messageList)
//     })

//     return () => unsubscribe()
//   }

//   // שליחת הודעה בצ'אט
//   const handleSendMessage = async () => {
//     if (newMessage.trim() === '') return

//     await addDoc(collection(db, 'jobChats', selectedChat.id, 'messages'), {
//       text: newMessage,
//       senderId: currentUser.uid, // מזהה השולח
//       receiverId: user.isEmployer ? selectedChat.applicantId : selectedChat.employerId, // מזהה המקבל
//       timestamp: serverTimestamp()
//     })

//     setNewMessage('')
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         {user.isEmployer ? 'צ\'אט מעסיק' : 'צ\'אט מועמד'}
//       </Typography>
//       <Paper elevation={3} sx={{ p: 2, display: 'flex', height: 'calc(100vh - 200px)' }}>
//         {/* צד שמאל - רשימת הצ'אטים */}
//         <Box sx={{ width: '30%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
//           <Typography variant="h6" gutterBottom>
//             {user.isEmployer ? 'העבודות שלי' : 'הצ\'אטים שלי'}
//           </Typography>
//           <List>
//             {chats.map((chat) => (
//               <ListItem button key={chat.id} onClick={() => handleChatClick(chat)}>
//                 <ListItemText 
//                   primary={chat.jobTitle} 
//                   secondary={user.isEmployer ? `מועמד: ${chat.applicantId}` : `מעסיק: ${chat.employerId}`} 
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </Box>

//         {/* צד ימין - ההודעות בצ'אט הנבחר */}
//         <Box sx={{ width: '70%', pl: 2 }}>
//           {selectedChat ? (
//             <>
//               <Typography variant="h6" gutterBottom>
//                 {user.isEmployer ? `שיחה עם מועמד ${selectedChat.applicantId}` : `שיחה עם מעסיק ${selectedChat.employerId}`}
//               </Typography>
//               <Box sx={{ height: 'calc(100% - 100px)', overflowY: 'auto', mb: 2 }}>
//                 {messages.map((message) => (
//                   <Box key={message.id} sx={{ mb: 1, textAlign: message.senderId === currentUser.uid ? 'right' : 'left' }}>
//                     <Typography variant="body2" sx={{ backgroundColor: message.senderId === currentUser.uid ? '#e3f2fd' : '#f5f5f5', p: 1, borderRadius: 1, display: 'inline-block' }}>
//                       {message.text}
//                     </Typography>
//                     <Typography variant="caption" display="block" color="text.secondary">
//                       {message.timestamp?.toDate().toLocaleString()}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Box>
//               <Divider />
//               <Box sx={{ mt: 2, display: 'flex' }}>
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   size="small"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="הקלד הודעה..."
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter') {
//                       handleSendMessage()
//                     }
//                   }}
//                 />
//                 <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
//                   שלח
//                 </Button>
//               </Box>
//             </>
//           ) : (
//             <Typography variant="body1" sx={{ textAlign: 'center', mt: 10 }}>
//               בחר צ'אט כדי להתחיל שיחה
//             </Typography>
//           )}
//         </Box>
//       </Paper>
//     </Box>
//   )
// }











import React, { useState, useEffect, useContext } from 'react'
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Box, 
  TextField, 
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getAuth } from 'firebase/auth'
import { AuthContext } from '../contexts/AuthContext'

export default function JobChat() {
  const { user } = useContext(AuthContext)  // נשתמש בקונטקסט של המשתמש כדי להגדיר את התפקיד שלו
  const [role, setRole] = useState(null)  // משתנה לשמירת תפקיד המשתמש (מעסיק או עובד)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentUser = getAuth().currentUser

  useEffect(() => {
    if (!currentUser) return

    const fetchUserRole = async () => {
      try {
        // שליפת מידע המשתמש מ-Firebase לפי ה-UID
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnapshot = await getDoc(userRef)
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data()
          setRole(userData.isEmployer ? 'employer' : 'employee')  // הגדרת תפקיד המשתמש
        }
      } catch (err) {
        console.error("Error fetching user role:", err)
        setError("שגיאה בשליפת התפקיד")
      }
    }

    fetchUserRole()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || !role) return

    setLoading(true)
    const chatsQuery = query(
      collection(db, 'jobChats'),
      where(role === 'employer' ? 'employerId' : 'applicantId', '==', currentUser.uid)
    )
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChats(chatList)
      setLoading(false)
    }, (err) => {
      console.error("Error fetching chats:", err)
      setError("אירעה שגיאה בטעינת הצ'אטים")
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser, role])

  const handleChatClick = (chat) => {
    setSelectedChat(chat)

    const messagesQuery = query(
      collection(db, 'jobChats', chat.id, 'messages'),
      orderBy('timestamp')
    )
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(messageList)
    })

    return () => unsubscribe()
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return

    await addDoc(collection(db, 'jobChats', selectedChat.id, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: role === 'employer' ? selectedChat.applicantId : selectedChat.employerId,  // לפי התפקיד
      timestamp: serverTimestamp()
    })

    setNewMessage('')
  }

  if (loading) return <CircularProgress />

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {role === 'employer' ? 'צ\'אט מעסיק' : 'צ\'אט מועמד'}
      </Typography>
      <Paper elevation={3} sx={{ p: 2, display: 'flex', height: 'calc(100vh - 200px)' }}>
        <Box sx={{ width: '30%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
          <Typography variant="h6" gutterBottom>
            {role === 'employer' ? 'העבודות שלי' : 'הצ\'אטים שלי'}
          </Typography>
          <List>
            {chats.map((chat) => (
              <ListItem button key={chat.id} onClick={() => handleChatClick(chat)}>
                <ListItemText 
                  primary={chat.jobTitle} 
                  secondary={role === 'employer' ? `מועמד: ${chat.applicantId}` : `מעסיק: ${chat.employerId}`} 
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ width: '70%', pl: 2 }}>
          {selectedChat ? (
            <>
              <Typography variant="h6" gutterBottom>
                {role === 'employer' ? `שיחה עם מועמד ${selectedChat.applicantId}` : `שיחה עם מעסיק ${selectedChat.employerId}`}
              </Typography>
              <Box sx={{ height: 'calc(100% - 100px)', overflowY: 'auto', mb: 2 }}>
                {messages.map((message) => (
                  <Box key={message.id} sx={{ mb: 1, textAlign: message.senderId === currentUser.uid ? 'right' : 'left' }}>
                    <Typography variant="body2" sx={{ backgroundColor: message.senderId === currentUser.uid ? '#e3f2fd' : '#f5f5f5', p: 1, borderRadius: 1, display: 'inline-block' }}>
                      {message.text}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {message.timestamp?.toDate().toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider />
              <Box sx={{ mt: 2, display: 'flex' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="הקלד הודעה..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
                  שלח
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 10 }}>
              בחר צ'אט כדי להתחיל שיחה
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  )
}













