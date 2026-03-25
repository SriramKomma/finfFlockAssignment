"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Archive, History, Plus } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks?limit=100");
      setTasks(res.data);
    } catch {
      toast.error("Could not fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenForm = (task?: Task) => {
    if (task) {
      setCurrentTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
      });
    } else {
      setCurrentTask(null);
      setFormData({ title: "", description: "", priority: "Medium", status: "Pending" });
    }
    setIsFormOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (currentTask) {
        await api.put(`/tasks/${currentTask.id}`, formData);
        toast.success("Task updated successfully");
      } else {
        await api.post("/tasks", formData);
        toast.success("Task created successfully");
      }
      setIsFormOpen(false);
      fetchTasks();
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success("Task deleted");
        fetchTasks();
      } catch {
        toast.error("Error retrieving history");
      }
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.post(`/tasks/${id}/archive`);
      toast.success("Task archived");
      fetchTasks();
    } catch {
      toast.error("Error archiving task");
    }
  };

  const handleViewHistory = async (id: number) => {
    try {
      const res = await api.get(`/tasks/${id}`);
      setTaskHistory(res.data.history);
      setIsHistoryOpen(true);
    } catch {
      toast.error("Could not load history");
    }
  };

  const priorityColor = (p: string) => {
    if (p === "High") return "text-red-500 bg-red-500/10";
    if (p === "Medium") return "text-yellow-500 bg-yellow-500/10";
    return "text-green-500 bg-green-500/10";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground mt-1">Manage your pending and completed tasks.</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">No tasks found. Create one!</TableCell></TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    {task.title}
                    {task.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{task.description}</p>}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(task.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewHistory(task.id)} title="History">
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(task)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleArchive(task.id)} title="Archive">
                      <Archive className="h-4 w-4 text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Task Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v || "Medium"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v || "Pending"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {taskHistory.length === 0 ? (
              <p className="text-muted-foreground text-center">No history recorded.</p>
            ) : (
              <div className="space-y-4">
                {taskHistory.map((h, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4 py-1 space-y-1">
                    <p className="text-sm font-semibold capitalize">{h.action_type}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(h.timestamp), "MMM d, yyyy h:mm a")}</p>
                    {h.previous_state && (
                      <div className="bg-muted p-2 rounded mt-2 text-xs font-mono overflow-auto">
                        {JSON.stringify(h.previous_state, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
