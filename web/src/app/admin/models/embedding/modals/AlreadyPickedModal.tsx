import React from "react";
import { Modal } from "@/components/Modal";
import { Button, Text } from "@tremor/react";

import {
  CloudEmbeddingModel,
  CloudEmbeddingProvider,
} from "../components/types";

// 1. Model Provider Not Configured
export function AlreadyPickedModal({
  model,
  onClose,
}: {
  model: CloudEmbeddingModel;
  onClose: () => void;
}) {
  return (
    <Modal title={`${model.name} already chosen`} onOutsideClick={onClose}>
      <div className="mb-4">
        <Text className="text-lg mb-2">
          Heads up: {model.name} is your current model!
        </Text>
        <Text className="text-sm mb-2">
          You can select a different one if you want!
        </Text>
        <div className="flex mt-8 justify-between">
          <Button color="blue" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
