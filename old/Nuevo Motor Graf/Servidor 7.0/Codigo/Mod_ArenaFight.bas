Attribute VB_Name = "Mod_ArenaFight"
Option Explicit

Private Type tRetos
    Run As Boolean
    Rounds As Byte
    AttackerIndex As Integer
    VictimIndex As Integer
End Type

Public Retos() As tRetos
