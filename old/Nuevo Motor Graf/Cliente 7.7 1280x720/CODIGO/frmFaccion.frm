VERSION 5.00
Begin VB.Form frmFaccion 
   BorderStyle     =   0  'None
   Caption         =   "Faccion"
   ClientHeight    =   6690
   ClientLeft      =   0
   ClientTop       =   0
   ClientWidth     =   10095
   LinkTopic       =   "Form1"
   MinButton       =   0   'False
   Picture         =   "frmFaccion.frx":0000
   ScaleHeight     =   6690
   ScaleWidth      =   10095
   StartUpPosition =   2  'CenterScreen
   Begin VB.Image Mercenario 
      Height          =   2055
      Left            =   120
      Top             =   4560
      Width           =   9855
   End
   Begin VB.Image Alianza 
      Height          =   4335
      Left            =   5160
      Top             =   120
      Width           =   4815
   End
   Begin VB.Image Horda 
      Height          =   4335
      Left            =   120
      Top             =   120
      Width           =   4815
   End
End
Attribute VB_Name = "frmFaccion"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub Alianza_Click()

    SendData ("ALIANZA")

    Unload Me

End Sub

Private Sub Horda_Click()

    SendData ("HORDA")

    Unload Me

End Sub

Private Sub Mercenario_Click()

    SendData ("LEGION")

    Unload Me

End Sub
