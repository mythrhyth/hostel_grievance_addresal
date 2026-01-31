import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, Users } from 'lucide-react';
import { voteOnPoll } from '@/services/pollService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface PollCardProps {
  poll: {
    _id: string;
    question: string;
    options: Array<{
      text: string;
      votes: number;
      voters: Array<{ _id: string; name: string }>;
    }>;
    totalVotes: number;
    userVoted: boolean;
    userVote?: number;
    isExpired: boolean;
    expiresAt?: string;
    createdBy: {
      name: string;
      role: string;
    };
    createdAt: string;
  };
  onVote?: () => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = async (optionIndex: number) => {
    if (voting || poll.userVoted || poll.isExpired) return;
    
    setVoting(true);
    setSelectedOption(optionIndex);
    
    try {
      await voteOnPoll(poll._id, optionIndex);
      toast.success('Vote recorded successfully');
      onVote?.(); // Refresh poll data
    } catch (error: any) {
      console.error('Failed to vote:', error);
      toast.error(error.response?.data?.message || 'Failed to vote');
      setSelectedOption(null);
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getOptionColor = (index: number) => {
    if (poll.userVoted && poll.userVote === index) return 'bg-primary text-primary-foreground';
    if (selectedOption === index) return 'bg-primary/20 text-primary';
    return 'bg-muted';
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Poll
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{poll.question}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {poll.totalVotes} votes
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Poll Options */}
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const percentage = getPercentage(option.votes);
            const hasVoted = poll.userVoted && poll.userVote === index;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{option.text}</span>
                    {hasVoted && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Your vote
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground min-w-[60px] text-right">
                    {option.votes} votes ({percentage}%)
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getOptionColor(index)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Vote Button */}
                {!poll.userVoted && !poll.isExpired && (
                  <Button
                    variant={selectedOption === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote(index)}
                    disabled={voting}
                    className="w-full"
                  >
                    {voting ? 'Voting...' : 'Vote'}
                  </Button>
                )}
                
                {/* Show voters */}
                {option.voters.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Voted by: {option.voters.map(v => v.name).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Poll Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div>
            Created by {poll.createdBy.name} ({poll.createdBy.role})
          </div>
          {poll.isExpired && (
            <span className="text-orange-600 font-medium">Expired</span>
          )}
          {poll.expiresAt && !poll.isExpired && (
            <span>Expires {formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
