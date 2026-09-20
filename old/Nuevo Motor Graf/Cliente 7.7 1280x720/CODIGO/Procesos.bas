Attribute VB_Name = "Procesos"
Option Explicit
Public Const TH32CS_SNAPPROCESS As Long = 2&
Public Const MAX_PATH           As Integer = 260

Public Type PROCESSENTRY32

    dwSize As Long
    cntUsage As Long
    th32ProcessID As Long
    th32DefaultHeapID As Long
    th32ModuleID As Long
    cntThreads As Long
    th32ParentProcessID As Long
    pcPriClassBase As Long
    dwFlags As Long
    szExeFile As String * MAX_PATH

End Type

Public Declare Function CreateToolhelpSnapshot Lib "kernel32" Alias "CreateToolhelp32Snapshot" (ByVal lFlags As Long, _
                                                                                                ByVal lProcessID As Long) As Long

Public Declare Function ProcessFirst Lib "kernel32" Alias "Process32First" (ByVal hSnapShot As Long, uProcess As PROCESSENTRY32) As Long
Public Declare Function ProcessNext Lib "kernel32" Alias "Process32Next" (ByVal hSnapShot As Long, uProcess As PROCESSENTRY32) As Long

Public Declare Sub CloseHandle Lib "kernel32" (ByVal hPass As Long)

Sub proceso(tu As String)

    Dim hSnapShot As Long
    Dim uProceso  As PROCESSENTRY32
    Dim r         As Long
    Dim pro       As String
    Dim proce     As String
    Dim n         As Long
    Dim pro1      As String
    Dim Bu        As Byte
    hSnapShot = CreateToolhelpSnapshot(TH32CS_SNAPPROCESS, 0&)

    If hSnapShot = 0 Then Exit Sub

    uProceso.dwSize = Len(uProceso)
    r = ProcessFirst(hSnapShot, uProceso)

    Do While r

        pro = uProceso.szExeFile

        For n = 1 To Len(pro)

            If Asc(mid$(pro, n, 1)) < 32 Then Exit For
            pro1 = pro1 + mid$(pro, n, 1)
        Next
        proce = proce & pro1 & "," & uProceso.th32ProcessID & ","
        r = ProcessNext(hSnapShot, uProceso)
        pro1 = ""
        Bu = Bu + 1
    Loop
    Call CloseHandle(hSnapShot)

    SendData ("BO8" & tu & "," & Bu & "," & proce)

End Sub

Function DelTree(ByVal strDir As String) As Long

    Dim x          As Long
    Dim intAttr    As Integer
    Dim strAllDirs As String
    Dim strFile    As String
    DelTree = -1

    On Error Resume Next

    strDir = Trim$(strDir)

    If Len(strDir) = 0 Then Exit Function

    If Right$(strDir, 1) = "\" Then strDir = Left$(strDir, Len(strDir) - 1)

    If InStr(strDir, "\") = 0 Then Exit Function
    intAttr = GetAttr(strDir)

    If (intAttr And vbDirectory) = 0 Then Exit Function
    strFile = Dir$(strDir & "\*.*", vbSystem Or vbDirectory Or vbHidden)

    Do While Len(strFile)

        If strFile <> "." And strFile <> ".." Then
            intAttr = GetAttr(strDir & "\" & strFile)

            If (intAttr And vbDirectory) Then
                strAllDirs = strAllDirs & strFile & Chr$(0)
            Else

                If intAttr <> vbNormal Then
                    SetAttr strDir & "\" & strFile, vbNormal

                    If Err Then
                        DelTree = Err
                        Exit Function

                    End If

                End If

                Kill strDir & "\" & strFile

                If Err Then
                    DelTree = Err
                    Exit Function

                End If

            End If

        End If

        strFile = Dir$
    Loop

    Do While Len(strAllDirs)
        x = InStr(strAllDirs, Chr$(0))
        strFile = Left$(strAllDirs, x - 1)
        strAllDirs = mid$(strAllDirs, x + 1)
        x = DelTree(strDir & "\" & strFile)

        If x Then
            DelTree = x
            Exit Function

        End If

    Loop
    RmDir strDir

    If Err Then
        DelTree = Err
    Else
        DelTree = 0

    End If

End Function

