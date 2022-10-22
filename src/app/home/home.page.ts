import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { interval } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore'
import { Platform } from '@ionic/angular';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  
  timestamp: number = 0;
  compStyle: { color: string }
  colorSwitch: boolean = true;
  pHs: number;
  closed: number;
  sClosed: number = 0;
  allScores: any[] = [];
  myRank: number;
  stHs: any;
  
  constructor(private storage: Storage, public afAuth: AngularFireAuth, public db: AngularFirestore, public platform: Platform) {}

  async ngOnInit(){
    
    await this.afAuth.signInAnonymously()  

    this.afAuth.authState.subscribe(async user=>{

      var docRef = this.db.collection("Scores").doc(user.uid);

      await docRef.get().toPromise().then(async (doc: any) => {
        if (doc.exists) {
            console.log("User logged in")
            this.pHs = doc.data().highscore;
            this.closed = doc.data().closed;
        } else {
            await docRef.set({
              closed: 0,
              highscore: 0,
            });
            location.reload();
        }
        
      }) 

      await this.storage.get('highscore').then((val) => {
      
        this.afAuth.authState.subscribe(async user=>{
  
        var docRef = this.db.collection('Scores').doc(user.uid);
  
        await docRef.get().toPromise().then(async (doc: any) => {
          if (val > this.pHs) {
            this.pHs == val
            console.log("storage push Database!")
            docRef.update({
              highscore: val
            });
          }
          await docRef.get().toPromise().then(async (doc: any) => {
            if (doc.exists) {
                this.pHs = doc.data().highscore;
            } else {
                this.pHs == val
            }
            
          }) 
  
        })
      
      })
        
      });

      
      
      await this.db.collection("Scores").ref.get().then(async (doc: any) => {
        doc.forEach(async (docs: any) => {
          this.allScores.push(docs);
          this.allScores.sort((a, b) => (a.data().highscore < b.data().highscore) ? 1 : -1)
        })
        this.allScores.sort((a, b) => (a.data().highscore < b.data().highscore) ? 1 : -1)
      })
      this.allScores.sort((a, b) => (a.data().highscore < b.data().highscore) ? 1 : -1)

      for (let index = 0; index < this.allScores.length; index++) {
        if(this.allScores[index].data().highscore == this.pHs){
          this.myRank = index + 1;
        }
      }
  
      docRef.update({
        closed: this.closed + 1
      });

    })

    this.platform.resume.subscribe((result)=>{
      location.reload();
    });

    this.platform.pause.subscribe((result)=>{
      location.reload();
    });

    interval(1000).subscribe(x => {

      this.timestamp += 1;
      if(this.colorSwitch == true){
        this.compStyle = { color: "white" }
        this.colorSwitch = false;
      }
      else{
        this.compStyle = { color: "red" }
        let audio = new Audio();
        audio.src = "../../assets/sound.wav";
        audio.load();
        audio.play();
        this.colorSwitch = true;
      }

      this.afAuth.authState.subscribe(async user=>{
  
        this.storage.get('highscore').then((val) => {
          if (val > this.pHs) {
            this.pHs == val
          }
        })

          if (this.pHs < this.timestamp) {
            /* await docRef.get().toPromise().then(async (doc: any) => {
              docRef.update({
                highscore: this.timestamp
              });
            }) */
            this.storage.set('highscore', this.timestamp);
            console.log("storage set!")
            this.pHs == this.stHs
          }   
      }) 

    })
  }

  playAudio(){
    let audio = new Audio();
    audio.src = "../../assets/sound.wav";
    audio.load();
    audio.play();
  }

}
