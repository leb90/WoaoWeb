VERSION 5.00
Begin VB.Form frmRetos 
   BorderStyle     =   0  'None
   Caption         =   "Form1"
   ClientHeight    =   5550
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   5520
   LinkTopic       =   "frmRetos"
   Picture         =   "frmRetos.frx":0000
   ScaleHeight     =   5550
   ScaleWidth      =   5520
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.TextBox Oro21 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   3250
      TabIndex        =   5
      Text            =   "1"
      Top             =   4060
      Width           =   1640
   End
   Begin VB.TextBox Jug23 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   3240
      TabIndex        =   4
      Text            =   "Retante2"
      Top             =   3250
      Width           =   1600
   End
   Begin VB.TextBox Jug22 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   3240
      TabIndex        =   3
      Text            =   "Retante1"
      Top             =   2520
      Width           =   1600
   End
   Begin VB.TextBox Jug21 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   3240
      TabIndex        =   2
      Text            =   "Compañero"
      Top             =   1800
      Width           =   1600
   End
   Begin VB.TextBox Oro1 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   660
      TabIndex        =   1
      Text            =   "1"
      Top             =   2520
      Width           =   1650
   End
   Begin VB.TextBox Jug1 
      BackColor       =   &H00000000&
      ForeColor       =   &H00FFFFFF&
      Height          =   285
      Left            =   660
      TabIndex        =   0
      Text            =   "Nombre"
      Top             =   1800
      Width           =   1650
   End
   Begin VB.Image Image3 
      Height          =   375
      Left            =   4920
      Top             =   240
      Width           =   375
   End
   Begin VB.Image Image2 
      Height          =   495
      Left            =   3240
      Top             =   4560
      Width           =   1575
   End
   Begin VB.Image Image1 
      Height          =   495
      Left            =   600
      Top             =   3000
      Width           =   1695
   End
End
Attribute VB_Name = "frmRetos"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub Image1_Click()

    SendData ("/DUELO " & frmRetos.Jug1 & "@" & frmRetos.Oro1)

End Sub

Private Sub Image2_Click()

    SendData ("/DUAL " & frmRetos.Jug21 & " " & frmRetos.Jug22 & " " & frmRetos.Jug23 & " " & frmRetos.Oro21)

End Sub

Private Sub Image3_Click()

    Unload Me

End Sub
