import AutoSizer from "react-virtualized-auto-sizer";

import {
  forwardRef,
  SetStateAction,
  useRef,
  useEffect,
  Dispatch,
  useCallback,
  useState,
} from "react";

import { AIMessage, HumanMessage } from "../message/Messages";
import { getCitedDocumentsFromMessage, personaIncludesRetrieval } from "../lib";

export const ChatMessage = ({ index, data }: { index: any; data: any }) => {
  const {
    stopGenerating,
    currentSessionChatState,
    parentMessage,
    messageHistory,
    completeMessageDetail,
    onSubmit,
    upsertToCompleteMessageMap,
    setSelectedMessageForDocDisplay,
    setMessageAsLatest,
    selectedMessageForDocDisplay,
    setCurrentFeedback,
    liveAssistant,
    setStackTraceModalContent,
    availableAssistants,
    toggleDocumentSelectionAspects,
    selectedDocuments,
    setPopup,
    retrievalEnabled,
    updateCompleteMessageDetail,
    currentSessionId,
    currentSessionRegenerationState,
    continueGenerating,
    currentCanContinue,
    lastMessageRef,
    createRegenerator,
  } = data;

  const i = index;
  const message = messageHistory[index];
  const messageMap = completeMessageDetail.messageMap;
  const messageReactComponentKey = `${index}-${completeMessageDetail.sessionId}`;
  if (message.type === "user") {
    return (
      <div key={messageReactComponentKey}>
        <HumanMessage
          stopGenerating={stopGenerating}
          content={message.message}
          files={message.files}
          messageId={message.messageId}
          onEdit={(editedContent) => {
            const parentMessageId = message.parentMessageId!;
            const parentMessage = messageMap.get(parentMessageId)!;
            upsertToCompleteMessageMap({
              messages: [
                {
                  ...parentMessage,
                  latestChildMessageId: null,
                },
              ],
            });
            onSubmit({
              messageIdToResend: message.messageId || undefined,
              messageOverride: editedContent,
            });
          }}
          otherMessagesCanSwitchTo={parentMessage?.childrenMessageIds || []}
          onMessageSelection={(messageId) => {
            const newCompleteMessageMap = new Map(messageMap);
            newCompleteMessageMap.get(
              message.parentMessageId!
            )!.latestChildMessageId = messageId;
            updateCompleteMessageDetail(
              currentSessionId(),
              newCompleteMessageMap
            );
            setSelectedMessageForDocDisplay(messageId);
            // set message as latest so we can edit this message
            // and so it sticks around on page reload
            setMessageAsLatest(messageId);
          }}
        />
      </div>
    );
  } else if (message.type === "assistant") {
    const isShowingRetrieved =
      (selectedMessageForDocDisplay !== null &&
        selectedMessageForDocDisplay === message.messageId) ||
      i === messageHistory.length - 1;
    const previousMessage = i !== 0 ? messageHistory[i - 1] : null;

    const currentAlternativeAssistant =
      message.alternateAssistantID != null
        ? availableAssistants.find(
            (persona) => persona.id == message.alternateAssistantID
          )
        : null;

    if (
      currentSessionRegenerationState?.regenerating &&
      currentSessionChatState == "loading" &&
      message.messageId == messageHistory.length - 1
    ) {
      return <></>;
    }
    return (
      <div
        key={messageReactComponentKey}
        ref={i == messageHistory.length - 1 ? lastMessageRef : null}
      >
        <AIMessage
          continueGenerating={
            i == messageHistory.length - 1 && currentCanContinue()
              ? continueGenerating
              : undefined
          }
          overriddenModel={message.overridden_model}
          regenerate={createRegenerator({
            messageId: message.messageId,
            parentMessage: parentMessage!,
          })}
          otherMessagesCanSwitchTo={parentMessage?.childrenMessageIds || []}
          onMessageSelection={(messageId) => {
            const newCompleteMessageMap = new Map(messageMap);
            newCompleteMessageMap.get(
              message.parentMessageId!
            )!.latestChildMessageId = messageId;

            updateCompleteMessageDetail(
              currentSessionId(),
              newCompleteMessageMap
            );

            setSelectedMessageForDocDisplay(messageId);
            // set message as latest so we can edit this message
            // and so it sticks around on page reload
            setMessageAsLatest(messageId);
          }}
          isActive={messageHistory.length - 1 == i}
          selectedDocuments={selectedDocuments}
          toggleDocumentSelection={toggleDocumentSelectionAspects}
          docs={message.documents}
          currentPersona={liveAssistant}
          alternativeAssistant={currentAlternativeAssistant}
          messageId={message.messageId}
          content={message.message}
          // content={message.message}
          files={message.files}
          query={messageHistory[i]?.query || undefined}
          personaName={liveAssistant.name}
          citedDocuments={getCitedDocumentsFromMessage(message)}
          toolCall={message.toolCalls && message.toolCalls[0]}
          isComplete={
            i !== messageHistory.length - 1 ||
            (currentSessionChatState != "streaming" &&
              currentSessionChatState != "toolBuilding")
          }
          hasDocs={(message.documents && message.documents.length > 0) === true}
          handleFeedback={
            i === messageHistory.length - 1 &&
            currentSessionChatState != "input"
              ? undefined
              : (feedbackType) =>
                  setCurrentFeedback([
                    feedbackType,
                    message.messageId as number,
                  ])
          }
          handleSearchQueryEdit={
            i === messageHistory.length - 1 &&
            currentSessionChatState == "input"
              ? (newQuery) => {
                  if (!previousMessage) {
                    setPopup({
                      type: "error",
                      message:
                        "Cannot edit query of first message - please refresh the page and try again.",
                    });
                    return;
                  }
                  if (previousMessage.messageId === null) {
                    setPopup({
                      type: "error",
                      message:
                        "Cannot edit query of a pending message - please wait a few seconds and try again.",
                    });
                    return;
                  }
                  onSubmit({
                    messageIdToResend: previousMessage.messageId,
                    queryOverride: newQuery,
                    alternativeAssistantOverride: currentAlternativeAssistant,
                  });
                }
              : undefined
          }
          isCurrentlyShowingRetrieved={isShowingRetrieved}
          handleShowRetrieved={(messageNumber) => {
            if (isShowingRetrieved) {
              setSelectedMessageForDocDisplay(null);
            } else {
              if (messageNumber !== null) {
                setSelectedMessageForDocDisplay(messageNumber);
              } else {
                setSelectedMessageForDocDisplay(-1);
              }
            }
          }}
          handleForceSearch={() => {
            if (previousMessage && previousMessage.messageId) {
              onSubmit({
                messageIdToResend: previousMessage.messageId,
                forceSearch: true,
                alternativeAssistantOverride: currentAlternativeAssistant,
              });
            } else {
              setPopup({
                type: "error",
                message:
                  "Failed to force search - please refresh the page and try again.",
              });
            }
          }}
          retrievalDisabled={
            currentAlternativeAssistant
              ? !personaIncludesRetrieval(currentAlternativeAssistant!)
              : !retrievalEnabled
          }
        />
      </div>
    );
  } else {
    return (
      <div key={messageReactComponentKey}>
        <AIMessage
          currentPersona={liveAssistant}
          messageId={message.messageId}
          personaName={liveAssistant.name}
          content={
            <p className="text-red-700 text-sm my-auto">
              {message.message}
              {message.stackTrace && (
                <span
                  onClick={() => setStackTraceModalContent(message.stackTrace!)}
                  className="ml-2 cursor-pointer underline"
                >
                  Show stack trace.
                </span>
              )}
            </p>
          }
        />
      </div>
    );
  }
};
